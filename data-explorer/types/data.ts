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

  export interface ModuleFindings {
    key_improvement: string;
    statistical_significance: {
      p_value: string;
      effect_size: number;
    };
    narrative: string;
    feedback: string[];
    improvements: string[];
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
        keyFindings: [{key: string; description: string}];
      };
    };
    demographics: {
      totalParticipants: number;
      undergraduate: number;
      postgraduate: number;
      fields: [{name: string; value: number}];
    };
    timeline: {
      phases: Array<{
        phase: string;
        date: string;
        metrics: Record<string, number>;
      }>;
    };
    recommendations: [
      {
        area: string;
        description: string;
        benefits: string[];
      }
    ];
    findings: {
      overallImpact: {
        keyMetrics: [{metric: string; value: number}];
        studentSatisfaction: number;
        industryReadiness: {
          selfReported: number;
          clientRating: number;
        };
      };
      learningOutcomes: {
        moduleSpecificFindings: {
          [key: string]: ModuleFindings;
        };
      };
      professionalReadiness: {};
    };
    methodology: {};
    limitations: [];
    references: [];
  }

  export interface MetricsData {
    cohorts: any[];
    assessmentMetrics: any[];
    moduleMetrics: any[];
    skillMetrics: any[];
  }
