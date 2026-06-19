import { Document, Types } from 'mongoose';
export declare class ChatMessage {
    sessionId: string;
    role: string;
    content: string;
    nodeId?: string;
    masteryDelta: number;
}
export type ChatMessageDocument = ChatMessage & Document;
export declare const ChatMessageSchema: import("mongoose").Schema<ChatMessage, Model<ChatMessage, any, any, any, Document<unknown, any, ChatMessage, any, {}> & ChatMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatMessage, Document<unknown, {}, import("mongoose").FlatRecord<ChatMessage>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ChatMessage> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class SendMessageDto {
    sessionId: string;
    content: string;
    nodeId?: string;
}
import { Model } from 'mongoose';
import { StudentsService } from '../students/students.module';
export declare class ChatService {
    private chatModel;
    private studentsService;
    constructor(chatModel: Model<ChatMessageDocument>, studentsService: StudentsService);
    sendMessage(dto: SendMessageDto): Promise<{
        role: string;
        content: any;
        nodeId: string;
        masteryDelta: number;
    }>;
    getHistory(sessionId: string): Promise<(import("mongoose").FlattenMaps<ChatMessageDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    private callGemini;
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(dto: SendMessageDto): Promise<{
        role: string;
        content: any;
        nodeId: string;
        masteryDelta: number;
    }>;
    getHistory(sessionId: string): Promise<(import("mongoose").FlattenMaps<ChatMessageDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
export declare class ChatModule {
}
