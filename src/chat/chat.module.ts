// ── Schema ───────────────────────────────────────────────────
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'chat_messages' })
export class ChatMessage {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ enum: ['user', 'assistant'], required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  nodeId?: string;

  @Prop({ default: 0 })
  masteryDelta: number;
}

export type ChatMessageDocument = ChatMessage & Document;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// ── DTO ──────────────────────────────────────────────────────
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  sessionId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsString()
  @IsOptional()
  nodeId?: string;
}

// ── Service ──────────────────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentsService } from '../students/students.module';

const NODE_NAMES: Record<string, string> = {
  M1:'Conceitos Básicos de Matrizes', M2:'Operações com Matrizes',
  M3:'Determinantes', M4:'Sistemas Lineares',
  V1:'Conceitos Básicos de Vetores', V2:'Representação Vetorial',
  V3:'Operações com Vetores', V4:'Módulo de Vetores',
  V5:'Produto Escalar', V6:'Ângulo entre Vetores', V7:'Ortogonalidade',
};

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatModel: Model<ChatMessageDocument>,
    private studentsService: StudentsService,
  ) {}

  async sendMessage(dto: SendMessageDto) {
    // 1. Busca estado atual do aluno
    const progress = await this.studentsService.getProgress(dto.sessionId);
    const { student, mastery } = progress;

    // 2. Busca histórico recente do MongoDB
    const history = await this.chatModel
      .find({ sessionId: dto.sessionId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    const historyOrdered = history.reverse();

    // 3. Monta system prompt com modelo do aluno
    const currentName = NODE_NAMES[student.currentConceptId] || student.currentConceptId;
    const currentMastery = mastery[student.currentConceptId] ?? 0;
    const mastered = Object.entries(mastery)
      .filter(([, v]) => v >= 80).map(([k]) => k).join(', ') || 'nenhum ainda';
    const masteryStr = Object.entries(mastery)
      .map(([k, v]) => `  ${k}: ${v}%`).join('\n');

    const systemPrompt = `Você é um tutor especializado em Álgebra Linear para estudantes universitários brasileiros iniciantes. Responda SEMPRE em português.

MODELO DO ALUNO:
- Nome: ${student.name}
- Conceito atual: ${student.currentConceptId} — ${currentName}
- Nível: ${currentMastery < 40 ? 'iniciante' : currentMastery < 80 ? 'intermediário' : 'avançado'} (${currentMastery}%)
- Conceitos dominados: ${mastered}
- Domínio completo:\n${masteryStr}

INSTRUÇÕES PEDAGÓGICAS:
1. NUNCA entregue a resposta completa imediatamente — estimule o raciocínio
2. Adapte a linguagem ao nível do aluno
3. Forneça dicas progressivas: do mais geral para o mais específico
4. Use exemplos numéricos concretos
5. Elogie o esforço genuinamente
6. Ao avaliar resposta, inclua UMA tag: [MASTERY_UPDATE:correct], [MASTERY_UPDATE:wrong] ou [MASTERY_UPDATE:hint_correct]
7. Respostas concisas (máx. 220 palavras); use **negrito** para termos-chave
8. Use LaTeX com $$ para blocos de matrizes/equações`;

    // 4. Chama Gemini
    const messages = [
      ...historyOrdered.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: dto.content },
    ];

    const reply = await this.callGemini(systemPrompt, messages);

    // 5. Processa tag de mastery
    const tagMatch = reply.match(/\[MASTERY_UPDATE:(correct|wrong|hint_correct)\]/);
    let delta = 0;
    if (tagMatch) {
      delta = tagMatch[1] === 'correct' ? 20 : tagMatch[1] === 'hint_correct' ? 10 : -10;
      await this.studentsService.updateMastery(dto.sessionId, student.currentConceptId, delta);
    }

    const cleanReply = reply.replace(/\[MASTERY_UPDATE:[^\]]+\]/g, '').trim();

    // 6. Salva ambas as mensagens no MongoDB
    await this.chatModel.create([
      { sessionId: dto.sessionId, role: 'user', content: dto.content, nodeId: student.currentConceptId },
      { sessionId: dto.sessionId, role: 'assistant', content: cleanReply, nodeId: student.currentConceptId, masteryDelta: delta },
    ]);

    return {
      role: 'assistant',
      content: cleanReply,
      nodeId: student.currentConceptId,
      masteryDelta: delta,
    };
  }

  async getHistory(sessionId: string) {
    return this.chatModel
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();
  }

  private async callGemini(system: string, messages: { role: string; content: string }[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY não configurada');

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini error ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}

// ── Controller ───────────────────────────────────────────────
import { Controller, Post, Get, Body, Param } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @Get('history/:sessionId')
  getHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getHistory(sessionId);
  }
}

// ── Module ───────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }]),
    StudentsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
