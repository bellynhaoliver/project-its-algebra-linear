export declare class CreateStudentDto {
    name: string;
}
export declare class UpdateMasteryDto {
    nodeId: string;
    mastery: number;
}
import { Model } from 'mongoose';
import { StudentDocument } from './student.schema';
export declare class StudentsService {
    private studentModel;
    constructor(studentModel: Model<StudentDocument>);
    create(dto: CreateStudentDto): Promise<StudentDocument>;
    findBySession(sessionId: string): Promise<StudentDocument>;
    findById(id: string): Promise<StudentDocument>;
    updateMastery(sessionId: string, nodeId: string, delta: number): Promise<StudentDocument>;
    getProgress(sessionId: string): Promise<{
        student: {
            name: string;
            sessionId: string;
            currentConceptId: string;
        };
        mastery: Record<string, number>;
        stats: {
            averageMastery: number;
            conceptsMastered: number;
            conceptsTotal: number;
        };
    }>;
}
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(dto: CreateStudentDto): Promise<StudentDocument>;
    getProgress(sessionId: string): Promise<{
        student: {
            name: string;
            sessionId: string;
            currentConceptId: string;
        };
        mastery: Record<string, number>;
        stats: {
            averageMastery: number;
            conceptsMastered: number;
            conceptsTotal: number;
        };
    }>;
    updateMastery(sessionId: string, dto: UpdateMasteryDto): Promise<StudentDocument>;
}
export declare class StudentsModule {
}
