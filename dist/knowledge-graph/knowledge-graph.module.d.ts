import { StudentsService } from '../students/students.module';
export declare const NODES: {
    id: string;
    name: string;
    cat: string;
    prereqs: string[];
}[];
export declare class KnowledgeGraphService {
    private studentsService;
    constructor(studentsService: StudentsService);
    getGraph(): {
        nodes: {
            id: string;
            name: string;
            cat: string;
            prereqs: string[];
        }[];
        edges: {
            source: string;
            target: string;
        }[];
    };
    getStudentGraph(sessionId: string): Promise<{
        nodes: {
            mastery: number;
            state: string;
            isCurrent: boolean;
            id: string;
            name: string;
            cat: string;
            prereqs: string[];
        }[];
        edges: {
            source: string;
            target: string;
        }[];
    }>;
}
export declare class KnowledgeGraphController {
    private readonly kgService;
    constructor(kgService: KnowledgeGraphService);
    getGraph(): {
        nodes: {
            id: string;
            name: string;
            cat: string;
            prereqs: string[];
        }[];
        edges: {
            source: string;
            target: string;
        }[];
    };
    getStudentGraph(sessionId: string): Promise<{
        nodes: {
            mastery: number;
            state: string;
            isCurrent: boolean;
            id: string;
            name: string;
            cat: string;
            prereqs: string[];
        }[];
        edges: {
            source: string;
            target: string;
        }[];
    }>;
}
export declare class KnowledgeGraphModule {
}
