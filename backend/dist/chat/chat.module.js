"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = exports.ChatController = exports.ChatService = exports.SendMessageDto = exports.ChatMessageSchema = exports.ChatMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ChatMessage = class ChatMessage {
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['user', 'assistant'], required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ChatMessage.prototype, "nodeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ChatMessage.prototype, "masteryDelta", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'chat_messages' })
], ChatMessage);
exports.ChatMessageSchema = mongoose_1.SchemaFactory.createForClass(ChatMessage);
const class_validator_1 = require("class-validator");
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "nodeId", void 0);
const common_1 = require("@nestjs/common");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const students_module_1 = require("../students/students.module");
const NODE_NAMES = {
    M1: 'Conceitos Básicos de Matrizes', M2: 'Operações com Matrizes',
    M3: 'Determinantes', M4: 'Sistemas Lineares',
    V1: 'Conceitos Básicos de Vetores', V2: 'Representação Vetorial',
    V3: 'Operações com Vetores', V4: 'Módulo de Vetores',
    V5: 'Produto Escalar', V6: 'Ângulo entre Vetores', V7: 'Ortogonalidade',
};
let ChatService = class ChatService {
    constructor(chatModel, studentsService) {
        this.chatModel = chatModel;
        this.studentsService = studentsService;
    }
    async sendMessage(dto) {
        const progress = await this.studentsService.getProgress(dto.sessionId);
        const { student, mastery } = progress;
        const history = await this.chatModel
            .find({ sessionId: dto.sessionId })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();
        const historyOrdered = history.reverse();
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
        const messages = [
            ...historyOrdered.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: dto.content },
        ];
        const reply = await this.callGemini(systemPrompt, messages);
        const tagMatch = reply.match(/\[MASTERY_UPDATE:(correct|wrong|hint_correct)\]/);
        let delta = 0;
        if (tagMatch) {
            delta = tagMatch[1] === 'correct' ? 20 : tagMatch[1] === 'hint_correct' ? 10 : -10;
            await this.studentsService.updateMastery(dto.sessionId, student.currentConceptId, delta);
        }
        const cleanReply = reply.replace(/\[MASTERY_UPDATE:[^\]]+\]/g, '').trim();
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
    async getHistory(sessionId) {
        return this.chatModel
            .find({ sessionId })
            .sort({ createdAt: 1 })
            .lean();
    }
    async callGemini(system, messages) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            throw new Error('GEMINI_API_KEY não configurada');
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(ChatMessage.name)),
    __metadata("design:paramtypes", [mongoose_3.Model,
        students_module_1.StudentsService])
], ChatService);
const common_2 = require("@nestjs/common");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    sendMessage(dto) {
        return this.chatService.sendMessage(dto);
    }
    getHistory(sessionId) {
        return this.chatService.getHistory(sessionId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_2.Post)('message'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMessageDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_2.Get)('history/:sessionId'),
    __param(0, (0, common_2.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getHistory", null);
exports.ChatController = ChatController = __decorate([
    (0, common_2.Controller)('chat'),
    __metadata("design:paramtypes", [ChatService])
], ChatController);
const common_3 = require("@nestjs/common");
const mongoose_4 = require("@nestjs/mongoose");
const students_module_2 = require("../students/students.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_3.Module)({
        imports: [
            mongoose_4.MongooseModule.forFeature([{ name: ChatMessage.name, schema: exports.ChatMessageSchema }]),
            students_module_2.StudentsModule,
        ],
        controllers: [ChatController],
        providers: [ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map