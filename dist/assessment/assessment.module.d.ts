import { Document } from 'mongoose';
export declare class Assessment {
    sessionId: string;
    status: string;
    score: Record<string, number>;
    answers: {
        questionId: string;
        nodeId: string;
        isCorrect: boolean;
        selectedAnswer: number;
    }[];
}
export type AssessmentDocument = Assessment & Document;
export declare const AssessmentSchema: import("mongoose").Schema<Assessment, Model<Assessment, any, any, any, Document<unknown, any, Assessment, any, {}> & Assessment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Assessment, Document<unknown, {}, import("mongoose").FlatRecord<Assessment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Assessment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const QUESTIONS: {
    id: string;
    nodeId: string;
    text: string;
    options: string[];
    correct: number;
    diff: string;
}[];
export declare class StartAssessmentDto {
    sessionId: string;
}
export declare class SubmitAnswerDto {
    assessmentId: string;
    sessionId: string;
    questionId: string;
    selectedAnswer: number;
    usedHint: boolean;
}
import { Model } from 'mongoose';
import { StudentsService } from '../students/students.module';
export declare class AssessmentService {
    private assessmentModel;
    private studentsService;
    constructor(assessmentModel: Model<AssessmentDocument>, studentsService: StudentsService);
    start(dto: StartAssessmentDto): Promise<{
        assessmentId: import("mongoose").Types.ObjectId;
        questions: {
            id: string;
            nodeId: string;
            text: string;
            options: string[];
            correct: number;
            diff: string;
        }[];
    }>;
    submitAnswer(dto: SubmitAnswerDto): Promise<{
        isCorrect: boolean;
        correctAnswer: string;
        completed: boolean;
        score: Record<string, number>;
    }>;
    getResult(assessmentId: string): Promise<Document<unknown, {}, AssessmentDocument, {}, {}> & Assessment & Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export declare class AssessmentController {
    private readonly assessmentService;
    constructor(assessmentService: AssessmentService);
    start(dto: StartAssessmentDto): Promise<{
        assessmentId: import("mongoose").Types.ObjectId;
        questions: {
            id: string;
            nodeId: string;
            text: string;
            options: string[];
            correct: number;
            diff: string;
        }[];
    }>;
    submitAnswer(dto: SubmitAnswerDto): Promise<{
        isCorrect: boolean;
        correctAnswer: string;
        completed: boolean;
        score: Record<string, number>;
    }>;
    getResult(id: string): Promise<Document<unknown, {}, AssessmentDocument, {}, {}> & Assessment & Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export declare class AssessmentModule {
}
