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
exports.StudentsModule = exports.StudentsController = exports.StudentsService = exports.UpdateMasteryDto = exports.CreateStudentDto = void 0;
const class_validator_1 = require("class-validator");
class CreateStudentDto {
}
exports.CreateStudentDto = CreateStudentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "name", void 0);
class UpdateMasteryDto {
}
exports.UpdateMasteryDto = UpdateMasteryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMasteryDto.prototype, "nodeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateMasteryDto.prototype, "mastery", void 0);
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const student_schema_1 = require("./student.schema");
const crypto_1 = require("crypto");
const NODE_IDS = ['M1', 'M2', 'M3', 'M4', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
let StudentsService = class StudentsService {
    constructor(studentModel) {
        this.studentModel = studentModel;
    }
    async create(dto) {
        const sessionId = (0, crypto_1.randomBytes)(12).toString('hex');
        const mastery = Object.fromEntries(NODE_IDS.map(id => [id, 0]));
        const student = new this.studentModel({ ...dto, sessionId, mastery });
        return student.save();
    }
    async findBySession(sessionId) {
        const student = await this.studentModel.findOne({ sessionId });
        if (!student)
            throw new common_1.NotFoundException('Aluno não encontrado');
        return student;
    }
    async findById(id) {
        const student = await this.studentModel.findById(id);
        if (!student)
            throw new common_1.NotFoundException('Aluno não encontrado');
        return student;
    }
    async updateMastery(sessionId, nodeId, delta) {
        const student = await this.findBySession(sessionId);
        const current = student.mastery[nodeId] ?? 0;
        const updated = Math.max(0, Math.min(100, current + delta));
        student.mastery = { ...student.mastery, [nodeId]: updated };
        if (updated >= 80) {
            const idx = NODE_IDS.indexOf(nodeId);
            if (idx >= 0 && idx < NODE_IDS.length - 1) {
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
    async getProgress(sessionId) {
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
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StudentsService);
const common_2 = require("@nestjs/common");
let StudentsController = class StudentsController {
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    create(dto) {
        return this.studentsService.create(dto);
    }
    getProgress(sessionId) {
        return this.studentsService.getProgress(sessionId);
    }
    updateMastery(sessionId, dto) {
        return this.studentsService.updateMastery(sessionId, dto.nodeId, dto.mastery);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateStudentDto]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "create", null);
__decorate([
    (0, common_2.Get)(':sessionId/progress'),
    __param(0, (0, common_2.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getProgress", null);
__decorate([
    (0, common_2.Patch)(':sessionId/mastery'),
    __param(0, (0, common_2.Param)('sessionId')),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateMasteryDto]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "updateMastery", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_2.Controller)('students'),
    __metadata("design:paramtypes", [StudentsService])
], StudentsController);
const common_3 = require("@nestjs/common");
const mongoose_3 = require("@nestjs/mongoose");
const student_schema_2 = require("./student.schema");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_3.Module)({
        imports: [mongoose_3.MongooseModule.forFeature([{ name: student_schema_1.Student.name, schema: student_schema_2.StudentSchema }])],
        controllers: [StudentsController],
        providers: [StudentsService],
        exports: [StudentsService],
    })
], StudentsModule);
//# sourceMappingURL=students.module.js.map