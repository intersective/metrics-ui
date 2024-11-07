import React, { useState } from 'react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ChevronLeft, ChevronRight, Brain, BarChart2, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ResearchData } from '@/types/data';

export default function TimelineView({ data }: { data: ResearchData }) {
  const [activePhase, setActivePhase] = useState(0);
  
  const formatPhaseData = () => {
    return [
      {
        id: 0,
        title: "Research Setup",
        date: data.timeline.phases[0].date,
        icon: <Brain className="w-6 h-6"/>,
        metrics: [
          { label: "Students Enrolled", value: data.timeline.phases[0].metrics.studentsEnrolled },
          { label: "Modules Designed", value: data.timeline.phases[0].metrics.modulesDesigned },
          { label: "Target Skills", value: data.timeline.phases[0].metrics.targetSkills }
        ],
        chartData: formatSkillsData(data.modules, 'start')
      },
      {
        id: 1,
        title: "Data Collection",
        date: data.timeline.phases[1].date,
        icon: <BarChart2 className="w-6 h-6"/>,
        metrics: [
          { label: "Active Students", value: data.timeline.phases[1].metrics.activeStudents },
          { label: "Completion Rate", value: `${data.timeline.phases[1].metrics.completionRate}%` },
          { label: "Feedback Points", value: data.timeline.phases[1].metrics.feedbackPoints }
        ],
        chartData: formatProgressData(data.modules)
      },
      {
        id: 2,
        title: "Analysis",
        date: data.timeline.phases[2].date,
        icon: <Target className="w-6 h-6"/>,
        metrics: [
          { label: "Skill Improvement", value: `${data.timeline.phases[2].metrics.skillImprovement}%` },
          { label: "Student Satisfaction", value: `${data.timeline.phases[2].metrics.studentSatisfaction}%` },
          { label: "Industry Readiness", value: `${data.timeline.phases[2].metrics.industryReadiness}%` }
        ],
        chartData: formatSkillsData(data.modules, 'end')
      }
    ];
  };

  type Module = {
    skillImprovements: Record<string, { before: number; after: number }>;
    statisticalSignificance: { effectSize: number };
    participation: { cohort1: { completed: number; started: number }; cohort2: { completed: number; started: number } };
  };

  const formatSkillsData = (modules: Record<string, Module>, period: 'start' | 'end') => {
    if (!modules) return [];
    return Object.entries(modules).map(([key, value]) => ({
      skill: key,
      value: period === 'start' 
        ? value.skillImprovements[Object.keys(value.skillImprovements)[0]].before
        : value.skillImprovements[Object.keys(value.skillImprovements)[0]].after,
      improvement: value.statisticalSignificance.effectSize * 100
    }));
  };

  const formatProgressData = (modules: Record<string, Module>) => {
    if (!modules) return [];
    return Object.entries(modules).map(([key, value]) => ({
      module: key,
      completion: (value.participation.cohort1.completed + value.participation.cohort2.completed) /
                 (value.participation.cohort1.started + value.participation.cohort2.started) * 100,
      engagement: value.statisticalSignificance.effectSize * 100
    }));
  };

  const phases = formatPhaseData();

  const renderPhaseChart = (phase: { id: number; chartData: any[] }) => {
    switch (phase.id) {
      case 0:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={phase.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Initial Score" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 1:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={phase.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completion" stroke="#8884d8" name="Completion Rate" />
              <Line type="monotone" dataKey="engagement" stroke="#82ca9d" name="Engagement Score" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 2:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={phase.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Final Score" />
              <Bar dataKey="improvement" fill="#8884d8" name="Improvement" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Timeline Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
          className="p-2 rounded-full hover:bg-gray-100"
          disabled={activePhase === 0}
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex-1 mx-8">
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded">
              <div 
                className="h-2 bg-blue-600 rounded transition-all duration-500"
                style={{ width: `${((activePhase + 1) / phases.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-4">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id}
                  className={`flex flex-col items-center cursor-pointer
                    ${index === activePhase ? 'text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setActivePhase(index)}
                >
                  <div className={`p-2 rounded-full mb-2
                    ${index === activePhase ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {phase.icon}
                  </div>
                  <span className="text-sm font-medium">{phase.title}</span>
                  <span className="text-xs">{phase.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setActivePhase(Math.min(phases.length - 1, activePhase + 1))}
          className="p-2 rounded-full hover:bg-gray-100"
          disabled={activePhase === phases.length - 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Phase Content */}
      <Card>
        <CardHeader>
          <CardTitle>{phases[activePhase].title}</CardTitle>
          <CardDescription>{phases[activePhase].date}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {phases[activePhase].metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          {renderPhaseChart(phases[activePhase])}
        </CardContent>
      </Card>
    </div>
  );
}