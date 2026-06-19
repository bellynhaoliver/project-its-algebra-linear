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
exports.KnowledgeGraphModule = exports.KnowledgeGraphController = exports.KnowledgeGraphService = exports.NODES = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const students_module_1 = require("../students/students.module");
const students_module_2 = require("../students/students.module");
exports.NODES = [
    { id: 'M1', name: 'Conceitos Básicos de Matrizes', cat: 'matrix', prereqs: [] },
    { id: 'M2', name: 'Operações com Matrizes', cat: 'matrix', prereqs: ['M1'] },
    { id: 'M3', name: 'Determinantes', cat: 'matrix', prereqs: ['M2'] },
    { id: 'M4', name: 'Sistemas Lineares', cat: 'matrix', prereqs: ['M3'] },
    { id: 'V1', name: 'Conceitos Básicos de Vetores', cat: 'vector', prereqs: ['M1'] },
    { id: 'V2', name: 'Representação Vetorial', cat: 'vector', prereqs: ['V1'] },
    { id: 'V3', name: 'Operações com Vetores', cat: 'vector', prereqs: ['V2'] },
    { id: 'V4', name: 'Módulo de Vetores', cat: 'vector', prereqs: ['V3'] },
    { id: 'V5', name: 'Produto Escalar', cat: 'vector', prereqs: ['V4'] },
    { id: 'V6', name: 'Ângulo entre Vetores', cat: 'vector', prereqs: ['V5'] },
    { id: 'V7', name: 'Ortogonalidade', cat: 'vector', prereqs: ['V6'] },
];
const EDGES = exports.NODES.flatMap(n => n.prereqs.map(p => ({ source: p, target: n.id })));
function nodeState(mastery) {
    if (mastery >= 80)
        return 'mastered';
    if (mastery >= 40)
        return 'learning';
    if (mastery > 0)
        return 'struggling';
    return 'not_started';
}
let KnowledgeGraphService = class KnowledgeGraphService {
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    getGraph() {
        return { nodes: exports.NODES, edges: EDGES };
    }
    async getStudentGraph(sessionId) {
        const { mastery, student } = await this.studentsService.getProgress(sessionId);
        const nodes = exports.NODES.map(n => ({
            ...n,
            mastery: mastery[n.id] ?? 0,
            state: nodeState(mastery[n.id] ?? 0),
            isCurrent: n.id === student.currentConceptId,
        }));
        return { nodes, edges: EDGES };
    }
};
exports.KnowledgeGraphService = KnowledgeGraphService;
exports.KnowledgeGraphService = KnowledgeGraphService = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [students_module_2.StudentsService])
], KnowledgeGraphService);
let KnowledgeGraphController = class KnowledgeGraphController {
    constructor(kgService) {
        this.kgService = kgService;
    }
    getGraph() {
        return this.kgService.getGraph();
    }
    getStudentGraph(sessionId) {
        return this.kgService.getStudentGraph(sessionId);
    }
};
exports.KnowledgeGraphController = KnowledgeGraphController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KnowledgeGraphController.prototype, "getGraph", null);
__decorate([
    (0, common_1.Get)('student/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KnowledgeGraphController.prototype, "getStudentGraph", null);
exports.KnowledgeGraphController = KnowledgeGraphController = __decorate([
    (0, common_1.Controller)('knowledge-graph'),
    __metadata("design:paramtypes", [KnowledgeGraphService])
], KnowledgeGraphController);
let KnowledgeGraphModule = class KnowledgeGraphModule {
};
exports.KnowledgeGraphModule = KnowledgeGraphModule;
exports.KnowledgeGraphModule = KnowledgeGraphModule = __decorate([
    (0, common_3.Module)({
        imports: [students_module_1.StudentsModule],
        controllers: [KnowledgeGraphController],
        providers: [KnowledgeGraphService],
    })
], KnowledgeGraphModule);
//# sourceMappingURL=knowledge-graph.module.js.map