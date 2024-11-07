// utils/data-transforms.ts

import { ModuleData, ResearchData } from '@/types/data';

export const formatModuleData = (modules: Record<string, ModuleData>) => {
  return Object.entries(modules).map(([key, value]) => ({
    module: key,
    started: value.participation.cohort1.started + value.participation.cohort2.started,
    completed: value.participation.cohort1.completed + value.participation.cohort2.completed,
    rate: ((value.participation.cohort1.completed + value.participation.cohort2.completed) / 
           (value.participation.cohort1.started + value.participation.cohort2.started) * 100).toFixed(1)
  }));
};

export const formatRadarData = (modules: Record<string, ModuleData>) => {
  return Object.entries(modules).map(([key, value]) => ({
    subject: key,
    'Before AI': Object.values(value.skillImprovements)[0].before,
    'After AI': Object.values(value.skillImprovements)[0].after
  }));
};

export const formatPhaseData = (data: ResearchData) => {
  return data.timeline.phases.map((phase, index) => ({
    id: index,
    title: phase.phase,
    date: phase.date,
    metrics: Object.entries(phase.metrics).map(([key, value]) => ({
      label: key,
      value: typeof value === 'number' ? value.toString() : value
    }))
  }));
};