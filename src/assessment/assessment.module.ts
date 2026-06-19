// ── Schema ───────────────────────────────────────────────────
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'assessments' })
export class Assessment {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ enum: ['in_progress', 'completed'], default: 'in_progress' })
  status: string;

  @Prop({ type: Object, default: {} })
  score: Record<string, number>;

  @Prop({ type: Array, default: [] })
  answers: { questionId: string; nodeId: string; isCorrect: boolean; selectedAnswer: number }[];
}

export type AssessmentDocument = Assessment & Document;
export const AssessmentSchema = SchemaFactory.createForClass(Assessment);

// ── Questions Bank ────────────────────────────────────────────
export const QUESTIONS = [
  { id:'q_M1', nodeId:'M1', text:'Uma matriz 3×2 possui quantos elementos?', options:['3','5','6','9'], correct:2, diff:'fácil' },
  { id:'q_M2', nodeId:'M2', text:'Para multiplicar A (2×3) por B (3×4), a matriz resultado terá dimensão:', options:['2×4','3×3','4×2','Impossível'], correct:0, diff:'médio' },
  { id:'q_M3', nodeId:'M3', text:'O determinante de uma matriz identidade 3×3 é:', options:['0','3','1','−1'], correct:2, diff:'fácil' },
  { id:'q_M4', nodeId:'M4', text:'Um sistema com 3 equações e 2 incógnitas é classificado como:', options:['Subdeterminado','Determinado','Sobredeterminado','Impossível sempre'], correct:2, diff:'difícil' },
  { id:'q_V1', nodeId:'V1', text:'Um vetor no plano R² é representado por:', options:['Um único número','Um par ordenado (x,y)','Uma matriz quadrada','Uma equação de reta'], correct:1, diff:'fácil' },
  { id:'q_V2', nodeId:'V2', text:'A representação gráfica de um vetor é:', options:['Um ponto','Uma reta infinita','Uma seta com direção e sentido','Um segmento sem direção'], correct:2, diff:'fácil' },
  { id:'q_V3', nodeId:'V3', text:'Dados u=(1,2) e v=(3,4), qual é u+v?', options:['(4,6)','(2,2)','(3,8)','(4,4)'], correct:0, diff:'fácil' },
  { id:'q_V4', nodeId:'V4', text:'O módulo do vetor v=(3,4) é:', options:['7','5','1','12'], correct:1, diff:'médio' },
  { id:'q_V5', nodeId:'V5', text:'Dados u=(1,0) e v=(0,1), o produto escalar u·v é:', options:['1','0','−1','√2'], correct:1, diff:'médio' },
  { id:'q_V6', nodeId:'V6', text:'Se u·v=0, o ângulo entre u e v é:', options:['0°','45°','90°','180°'], correct:2, diff:'médio' },
  { id:'q_V7', nodeId:'V7', text:'Dois vetores são ortogonais quando seu produto escalar é:', options:['1','−1','0','Qualquer positivo'], correct:2, diff:'fácil' },
];

// ── DTOs ─────────────────────────────────────────────────────
import { IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class StartAssessmentDto {
  @IsString() sessionId: string;
}

export class SubmitAnswerDto {
  @IsString() assessmentId: string;
  @IsString() sessionId: string;
  @IsString() questionId: string;
  @IsNumber() @Min(0) @Max(3) selectedAnswer: number;
  @IsBoolean() usedHint: boolean;
}

// ── Service ───────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentsService } from '../students/students.module';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<AssessmentDocument>,
    private studentsService: StudentsService,
  ) {}

  async start(dto: StartAssessmentDto) {
    const assessment = await this.assessmentModel.create({
      sessionId: dto.sessionId,
      status: 'in_progress',
    });
    return { assessmentId: assessment._id, questions: QUESTIONS };
  }

  async submitAnswer(dto: SubmitAnswerDto) {
    const assessment = await this.assessmentModel.findById(dto.assessmentId);
    if (!assessment) throw new NotFoundException('Avaliação não encontrada');

    const question = QUESTIONS.find(q => q.id === dto.questionId);
    if (!question) throw new NotFoundException('Questão não encontrada');

    const isCorrect = dto.selectedAnswer === question.correct;

    assessment.answers.push({
      questionId: dto.questionId,
      nodeId: question.nodeId,
      isCorrect,
      selectedAnswer: dto.selectedAnswer,
    });
    assessment.markModified('answers');

    // Se respondeu todas, finaliza e calcula score
    if (assessment.answers.length >= QUESTIONS.length) {
      assessment.status = 'completed';
      const score: Record<string, number> = {};
      for (const q of QUESTIONS) {
        const ans = assessment.answers.find(a => a.questionId === q.id);
        score[q.nodeId] = ans?.isCorrect ? 100 : 0;
      }
      assessment.score = score;
      assessment.markModified('score');

      // Atualiza mastery do aluno no MongoDB
      for (const [nodeId, value] of Object.entries(score)) {
        const current = 0;
        const delta = value - current;
        if (delta !== 0) {
          await this.studentsService.updateMastery(dto.sessionId, nodeId, delta);
        }
      }
    }

    await assessment.save();

    return {
      isCorrect,
      correctAnswer: question.options[question.correct],
      completed: assessment.status === 'completed',
      score: assessment.status === 'completed' ? assessment.score : null,
    };
  }

  async getResult(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Avaliação não encontrada');
    return assessment;
  }
}

// ── Controller ────────────────────────────────────────────────
import { Controller, Post, Get, Body, Param } from '@nestjs/common';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('start')
  start(@Body() dto: StartAssessmentDto) {
    return this.assessmentService.start(dto);
  }

  @Post('answer')
  submitAnswer(@Body() dto: SubmitAnswerDto) {
    return this.assessmentService.submitAnswer(dto);
  }

  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.assessmentService.getResult(id);
  }
}

// ── Module ────────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Assessment.name, schema: AssessmentSchema }]),
    StudentsModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}
