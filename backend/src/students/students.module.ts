// ── DTOs ────────────────────────────────────────────────────
import { IsString, MinLength, MaxLength, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class UpdateMasteryDto {
  @IsString()
  nodeId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  mastery: number;
}

// ── Service ─────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { randomBytes } from 'crypto';

const NODE_IDS = ['M1','M2','M3','M4','V1','V2','V3','V4','V5','V6','V7'];

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentDocument> {
    const sessionId = randomBytes(12).toString('hex');
    const mastery = Object.fromEntries(NODE_IDS.map(id => [id, 0]));
    const student = new this.studentModel({ ...dto, sessionId, mastery });
    return student.save();
  }

  async findBySession(sessionId: string): Promise<StudentDocument> {
    const student = await this.studentModel.findOne({ sessionId });
    if (!student) throw new NotFoundException('Aluno não encontrado');
    return student;
  }

  async findById(id: string): Promise<StudentDocument> {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Aluno não encontrado');
    return student;
  }

  async updateMastery(sessionId: string, nodeId: string, delta: number): Promise<StudentDocument> {
    const student = await this.findBySession(sessionId);
    const current = student.mastery[nodeId] ?? 0;
    const updated = Math.max(0, Math.min(100, current + delta));
    student.mastery = { ...student.mastery, [nodeId]: updated };

    // Avança conceito atual se dominou (>=80%)
    if (updated >= 80) {
      const idx = NODE_IDS.indexOf(nodeId);
      if (idx >= 0 && idx < NODE_IDS.length - 1) {
        // Próximo conceito não dominado
        for (let i = idx + 1; i < NODE_IDS.length; i++) {
          if ((student.mastery[NODE_IDS[i]] ?? 0) < 80) {
            student.currentConceptId = NODE_IDS[i];
            break;
          }
        }
      }
    }

    student.markModified('mastery');
    return student.save();
  }

  async getProgress(sessionId: string) {
    const student = await this.findBySession(sessionId);
    const masteries = Object.values(student.mastery);
    const avg = Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length);
    const mastered = masteries.filter(m => m >= 80).length;
    return {
      student: {
        name: student.name,
        sessionId: student.sessionId,
        currentConceptId: student.currentConceptId,
      },
      mastery: student.mastery,
      stats: {
        averageMastery: avg,
        conceptsMastered: mastered,
        conceptsTotal: NODE_IDS.length,
      },
    };
  }
}

// ── Controller ───────────────────────────────────────────────
import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get(':sessionId/progress')
  getProgress(@Param('sessionId') sessionId: string) {
    return this.studentsService.getProgress(sessionId);
  }

  @Patch(':sessionId/mastery')
  updateMastery(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateMasteryDto,
  ) {
    return this.studentsService.updateMastery(sessionId, dto.nodeId, dto.mastery);
  }
}

// ── Module ───────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentSchema } from './student.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
