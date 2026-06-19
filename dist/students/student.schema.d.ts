import { Document, Types } from 'mongoose';
export declare class Student {
    name: string;
    sessionId: string;
    currentConceptId: string;
    mastery: Record<string, number>;
}
export type StudentDocument = Student & Document;
export declare const StudentSchema: import("mongoose").Schema<Student, import("mongoose").Model<Student, any, any, any, Document<unknown, any, Student, any, {}> & Student & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Student, Document<unknown, {}, import("mongoose").FlatRecord<Student>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Student> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
