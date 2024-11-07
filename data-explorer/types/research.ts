// types/research.ts

export interface SkillImprovement {
    before: number;
    after: number;
    improvement: number;
  }
  
  export interface ModuleParticipation {
    started: number;
    completed: number;
  }
  
  export interface ModuleData {
    participation: {
      cohort1: ModuleParticipation;
      cohort2: ModuleParticipation;
    };
    skillImprovements: Record<string, SkillImprovement>;
    statisticalSignificance: {
      pValue: number;
      effectSize: number;
    };
  }
  
  export interface ResearchData {
    metadata: {
      title: string;
      subtitle: string;
      institution: string;
      program: string;
      year: number;
      abstract: {
        summary: string;
        keyFindings: string[];
      };
    };
    modules: Record<string, ModuleData>;
    timeline: {
      phases: Array<{
        phase: string;
        date: string;
        metrics: Record<string, number>;
      }>;
    };
    recommendations: {
      futureImplementation: Array<{
        area: string;
        description: string;
        benefits: string[];
      }>;
    };
  }