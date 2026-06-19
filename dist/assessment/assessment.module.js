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
exports.AssessmentModule = exports.AssessmentController = exports.AssessmentService = exports.SubmitAnswerDto = exports.StartAssessmentDto = exports.QUESTIONS = exports.AssessmentSchema = exports.Assessment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Assessment = class Assessment {
};
exports.Assessment = Assessment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Assessment.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['in_progress', 'completed'], default: 'in_progress' }),
    __metadata("design:type", String)
], Assessment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Assessment.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Assessment.prototype, "answers", void 0);
exports.Assessment = Assessment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'assessments' })
], Assessment);
exports.AssessmentSchema = mongoose_1.SchemaFactory.createForClass(Assessment);
exports.QUESTIONS = [
    { id: 'q_M1', nodeId: 'M1', text: 'Uma matriz 3×2 possui quantos elementos?', options: ['3', '5', '6', '9'], correct: 2, diff: 'fácil' },
    { id: 'q_M2', nodeId: 'M2', text: 'Para multiplicar A (2×3) por B (3×4), a matriz resultado terá dimensão:', options: ['2×4', '3×3', '4×2', 'Impossível'], correct: 0, diff: 'médio' },
    { id: 'q_M3', nodeId: 'M3', text: 'O determinante de uma matriz identidade 3×3 é:', options: ['0', '3', '1', '−1'], correct: 2, diff: 'fácil' },
    { id: 'q_M4', nodeId: 'M4', text: 'Um sistema com 3 equações e 2 incógnitas é classificado como:', options: ['Subdeterminado', 'Determinado', 'Sobredeterminado', 'Impossível sempre'], correct: 2, diff: 'difícil' },
    { id: 'q_V1', nodeId: 'V1', text: 'Um vetor no plano R² é representado por:', options: ['Um único número', 'Um par ordenado (x,y)', 'Uma matriz quadrada', 'Uma equação de reta'], correct: 1, diff: 'fácil' },
    { id: 'q_V2', nodeId: 'V2', text: 'A representação gráfica de um vetor é:', options: ['Um ponto', 'Uma reta infinita', 'Uma seta com direção e sentido', 'Um segmento sem direção'], correct: 2, diff: 'fácil' },
    { id: 'q_V3', nodeId: 'V3', text: 'Dados u=(1,2) e v=(3,4), qual é u+v?', options: ['(4,6)', '(2,2)', '(3,8)', '(4,4)'], correct: 0, diff: 'fácil' },
    { id: 'q_V4', nodeId: 'V4', text: 'O módulo do vetor v=(3,4) é:', options: ['7', '5', '1', '12'], correct: 1, diff: 'médio' },
    { id: 'q_V5', nodeId: 'V5', text: 'Dados u=(1,0) e v=(0,1), o produto escalar u·v é:', options: ['1', '0', '−1', '√2'], correct: 1, diff: 'médio' },
    { id: 'q_V6', nodeId: 'V6', text: 'Se u·v=0, o ângulo entre u e v é:', options: ['0°', '45°', '90°', '180°'], correct: 2, diff: 'médio' },
    { id: 'q_V7', nodeId: 'V7', text: 'Dois vetores são ortogonais quando seu produto escalar é:', options: ['1', '−1', '0', 'Qualquer positivo'], correct: 2, diff: 'fácil' },
];
const class_validator_1 = require("class-validator");
class StartAssessmentDto {
}
exports.StartAssessmentDto = StartAssessmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartAssessmentDto.prototype, "sessionId", void 0);
class SubmitAnswerDto {
}
exports.SubmitAnswerDto = SubmitAnswerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "assessmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], SubmitAnswerDto.prototype, "selectedAnswer", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SubmitAnswerDto.prototype, "usedHint", void 0);
const common_1 = require("@nestjs/common");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const students_module_1 = require("../students/students.module");
let AssessmentService = class AssessmentService {
    constructor(assessmentModel, studentsService) {
        this.assessmentModel = assessmentModel;
        this.studentsService = studentsService;
    }
    async start(dto) {
        const assessment = await this.assessmentModel.create({
            sessionId: dto.sessionId,
            status: 'in_progress',
        });
        return { assessmentId: assessment._id, questions: exports.QUESTIONS };
    }
    async submitAnswer(dto) {
        const assessment = await this.assessmentModel.findById(dto.assessmentId);
        if (!assessment)
            throw new common_1.NotFoundException('Avaliação não encontrada');
        const question = exports.QUESTIONS.find(q => q.id === dto.questionId);
        if (!question)
            throw new common_1.NotFoundException('Questão não encontrada');
        const isCorrect = dto.selectedAnswer === question.correct;
        assessment.answers.push({
            questionId: dto.questionId,
            nodeId: question.nodeId,
            isCorrect,
            selectedAnswer: dto.selectedAnswer,
        });
        assessment.markModified('answers');
        if (assessment.answers.length >= exports.QUESTIONS.length) {
            assessment.status = 'completed';
            const score = {};
            for (const q of exports.QUESTIONS) {
                const ans = assessment.answers.find(a => a.questionId === q.id);
                score[q.nodeId] = ans?.isCorrect ? 100 : 0;
            }
            assessment.score = score;
            assessment.markModified('score');
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
    async getResult(assessmentId) {
        const assessment = await this.assessmentModel.findById(assessmentId);
        if (!assessment)
            throw new common_1.NotFoundException('Avaliação não encontrada');
        return assessment;
    }
};
exports.AssessmentService = AssessmentService;
exports.AssessmentService = AssessmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(Assessment.name)),
    __metadata("design:paramtypes", [mongoose_3.Model,
        students_module_1.StudentsService])
], AssessmentService);
const common_2 = require("@nestjs/common");
let AssessmentController = class AssessmentController {
    constructor(assessmentService) {
        this.assessmentService = assessmentService;
    }
    start(dto) {
        return this.assessmentService.start(dto);
    }
    submitAnswer(dto) {
        return this.assessmentService.submitAnswer(dto);
    }
    getResult(id) {
        return this.assessmentService.getResult(id);
    }
};
exports.AssessmentController = AssessmentController;
__decorate([
    (0, common_2.Post)('start'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartAssessmentDto]),
    __metadata("design:returntype", void 0)
], AssessmentController.prototype, "start", null);
__decorate([
    (0, common_2.Post)('answer'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmitAnswerDto]),
    __metadata("design:returntype", void 0)
], AssessmentController.prototype, "submitAnswer", null);
__decorate([
    (0, common_2.Get)(':id/result'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentController.prototype, "getResult", null);
exports.AssessmentController = AssessmentController = __decorate([
    (0, common_2.Controller)('assessment'),
    __metadata("design:paramtypes", [AssessmentService])
], AssessmentController);
const common_3 = require("@nestjs/common");
const mongoose_4 = require("@nestjs/mongoose");
const students_module_2 = require("../students/students.module");
let AssessmentModule = class AssessmentModule {
};
exports.AssessmentModule = AssessmentModule;
exports.AssessmentModule = AssessmentModule = __decorate([
    (0, common_3.Module)({
        imports: [
            mongoose_4.MongooseModule.forFeature([{ name: Assessment.name, schema: exports.AssessmentSchema }]),
            students_module_2.StudentsModule,
        ],
        controllers: [AssessmentController],
        providers: [AssessmentService],
    })
], AssessmentModule);
//# sourceMappingURL=assessment.module.js.map