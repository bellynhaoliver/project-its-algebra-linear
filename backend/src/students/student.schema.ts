// ── Schema ──────────────────────────────────────────────────
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ default: 'M1' })
  currentConceptId: string;

  // mastery: { M1: 0, M2: 0, ... }
  @Prop({ type: Object, default: {} })
  mastery: Record<string, number>;
}

export type StudentDocument = Student & Document;
export const StudentSchema = SchemaFactory.createForClass(Student);
