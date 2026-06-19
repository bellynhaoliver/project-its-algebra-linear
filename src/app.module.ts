import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from './students/students.module';
import { AssessmentModule } from './assessment/assessment.module';
import { ChatModule } from './chat/chat.module';
import { KnowledgeGraphModule } from './knowledge-graph/knowledge-graph.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/its_algebra',
    ),
    StudentsModule,
    AssessmentModule,
    ChatModule,
    KnowledgeGraphModule,
  ],
})
export class AppModule {}
