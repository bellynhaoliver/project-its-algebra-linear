// ── Knowledge Graph (sem banco — dados estáticos do domínio) ──
import { Controller, Get, Param } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { StudentsService } from '../students/students.module';

export const NODES = [
  { id:'M1', name:'Conceitos Básicos de Matrizes',  cat:'matrix', prereqs:[] },
  { id:'M2', name:'Operações com Matrizes',         cat:'matrix', prereqs:['M1'] },
  { id:'M3', name:'Determinantes',                  cat:'matrix', prereqs:['M2'] },
  { id:'M4', name:'Sistemas Lineares',              cat:'matrix', prereqs:['M3'] },
  { id:'V1', name:'Conceitos Básicos de Vetores',   cat:'vector', prereqs:['M1'] },
  { id:'V2', name:'Representação Vetorial',         cat:'vector', prereqs:['V1'] },
  { id:'V3', name:'Operações com Vetores',          cat:'vector', prereqs:['V2'] },
  { id:'V4', name:'Módulo de Vetores',              cat:'vector', prereqs:['V3'] },
  { id:'V5', name:'Produto Escalar',                cat:'vector', prereqs:['V4'] },
  { id:'V6', name:'Ângulo entre Vetores',           cat:'vector', prereqs:['V5'] },
  { id:'V7', name:'Ortogonalidade',                 cat:'vector', prereqs:['V6'] },
];

const EDGES = NODES.flatMap(n => n.prereqs.map(p => ({ source: p, target: n.id })));

function nodeState(mastery: number): string {
  if (mastery >= 80) return 'mastered';
  if (mastery >= 40) return 'learning';
  if (mastery > 0)  return 'struggling';
  return 'not_started';
}

@Injectable()
export class KnowledgeGraphService {
  constructor(private studentsService: StudentsService) {}

  getGraph() {
    return { nodes: NODES, edges: EDGES };
  }

  async getStudentGraph(sessionId: string) {
    const { mastery, student } = await this.studentsService.getProgress(sessionId);
    const nodes = NODES.map(n => ({
      ...n,
      mastery: mastery[n.id] ?? 0,
      state: nodeState(mastery[n.id] ?? 0),
      isCurrent: n.id === student.currentConceptId,
    }));
    return { nodes, edges: EDGES };
  }
}

@Controller('knowledge-graph')
export class KnowledgeGraphController {
  constructor(private readonly kgService: KnowledgeGraphService) {}

  @Get()
  getGraph() {
    return this.kgService.getGraph();
  }

  @Get('student/:sessionId')
  getStudentGraph(@Param('sessionId') sessionId: string) {
    return this.kgService.getStudentGraph(sessionId);
  }
}

@Module({
  imports: [StudentsModule],
  controllers: [KnowledgeGraphController],
  providers: [KnowledgeGraphService],
})
export class KnowledgeGraphModule {}
