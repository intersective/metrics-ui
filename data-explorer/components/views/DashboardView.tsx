import React, { useState, useEffect } from 'react';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Filter, ArrowUpCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { colors } from '@/lib/colors';
import { getButtonStyles } from '@/lib/colorUtils';
import { ResearchData, MetricsData } from '@/types/data';

export default function DashboardView({ rdata, mdata }: { rdata: ResearchData; mdata: MetricsData }) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [selectedModule, setSelectedModule] = useState<string>('collaboration');
  const [drilldownModule, setDrilldownModule] = useState(null);
  const [filteredCohorts, setFilteredCohorts] = useState(mdata.cohorts);
  const [radarData, setRadarData] = useState<{ 
    subject: string; 
    'Before Module': number; 
    'After Module': number; 
    description: string; 
    n: number; 
    p: number; 
    t_stat: number; 
    effect_size: number; 
  }[]>([]);
  const [skillData, setSkillData] = useState<{ 
    subject: string; 
    'Before Module': number; 
    'After Module': number; 
    description: string; 
    n: number; 
    p: number; 
    t_stat: number; 
    effect_size: number; 
  }[]>([]);

  useEffect(() => {
    if (selectedCohort === 'all') {
      setFilteredCohorts(mdata.cohorts);
    } else {
      setFilteredCohorts(mdata.cohorts.filter(cohort => cohort.key === selectedCohort));
    }
  }, [selectedCohort, mdata.cohorts]);

  useEffect(() => {
    const formatRadarData = () => {
      return mdata.moduleMetrics.map(module => {
        const skills = mdata.skillMetrics.filter(skill => skill.module === module.key);
        const beforeModule = filteredCohorts.reduce((sum, cohort) => {
          const skillSum = skills.reduce((skillSum, skill) => {
            return skillSum + (skill.data?.[cohort.key]?.average_baseline || 0);
          }, 0);
          return sum + (skillSum / skills.length);
        }, 0) / filteredCohorts.length;
        
        const afterModule = filteredCohorts.reduce((sum, cohort) => {
          const skillSum = skills.reduce((skillSum, skill) => {
            return skillSum + (skill.data?.[cohort.key]?.average_final || 0);
          }, 0);
          return sum + (skillSum / skills.length);
        }, 0) / filteredCohorts.length;

        const n = skills.reduce((sum, skill) => {
          return sum + (skill.data?.[filteredCohorts[0].key]?.n || 0);
        }, 0);
  
        const p = skills.reduce((sum, skill) => {
          return sum + (skill.data?.[filteredCohorts[0].key]?.p || 0);
        }, 0) / skills.length;
  
        const t_stat = skills.reduce((sum, skill) => {
          return sum + (skill.data?.[filteredCohorts[0].key]?.t_stat || 0);
        }, 0) / skills.length;
  
        const effect_size = skills.reduce((sum, skill) => {
          return sum + (skill.data?.[filteredCohorts[0].key]?.['Effect Size (Cohen\'s d)'] || 0);
        }, 0) / skills.length;
  
        return {
          subject: module.name,
          'Before Module': beforeModule,
          'After Module': afterModule,
          description: module.description,
          n,
          p,
          t_stat,
          effect_size
        };
      });
    };

    setRadarData(formatRadarData());
  }, [filteredCohorts, mdata.moduleMetrics, mdata.skillMetrics]);

  useEffect(() => {
    if (drilldownModule) {
      const formatSkillData = (moduleKey: string) => {
        const skills = mdata.skillMetrics.filter(skill => skill.module === moduleKey);

        return skills.map(skill => {
          const beforeSkill = filteredCohorts.reduce((sum, cohort) => {
            return sum + (skill.data?.[cohort.key]?.average_baseline || 0);
          }, 0) / filteredCohorts.filter(cohort => skill.data?.[cohort.key]?.average_baseline !== undefined).length;
          
          const afterSkill = filteredCohorts.reduce((sum, cohort) => {
            return sum + (skill.data?.[cohort.key]?.average_final || 0);
          }, 0) / filteredCohorts.filter(cohort => skill.data?.[cohort.key]?.average_final !== undefined).length;

          return {
            subject: skill.name,
            'Before Module': beforeSkill,
            'After Module': afterSkill,
            description: skill.description,
            n: skill.data?.[filteredCohorts[0].key]?.n,
            p: skill.data?.[filteredCohorts[0].key]?.p,
            t_stat: skill.data?.[filteredCohorts[0].key]?.t_stat,
            effect_size: skill.data?.[filteredCohorts[0].key]?.['Effect Size (Cohen\'s d)']
          };
        });
      };

      setSkillData(formatSkillData(drilldownModule));
    }
  }, [drilldownModule, filteredCohorts, mdata.skillMetrics]);

  const formatModuleData = () => {
    return mdata.moduleMetrics.map(module => {
      const totalStarted = filteredCohorts.reduce((sum, cohort) => sum + (module.participation.data[cohort.key]?.started || 0), 0);
      const totalCompleted = filteredCohorts.reduce((sum, cohort) => sum + (module.participation.data[cohort.key]?.completed || 0), 0);
      return {
        module: module.name,
        started: totalStarted,
        completed: totalCompleted,
        rate: totalStarted ? ((totalCompleted / totalStarted) * 100).toFixed(1) : '0'
      };
    });
  };

  const getFeedbackForModule = (moduleKey: string) => {
    if (!moduleKey) {
      moduleKey = 'collaboration';
    };
    return rdata.findings.learningOutcomes.moduleSpecificFindings[moduleKey].feedback;
  };

  const getImprovementSuggestionsForModule = (moduleKey: string) => {
    if (!moduleKey) {
      moduleKey = 'collaboration';
    };
    return rdata.findings.learningOutcomes.moduleSpecificFindings[moduleKey].improvements;
  };

  return (
    <div className="space-y-8">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: colors.primary.main }}>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: colors.secondary.main }}>{rdata.metadata.abstract.summary}</p>
          </CardContent>
        </Card>
        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="flex items-center justify-start p-3">
                    <h2 className="text-3xl font-semibold me-3 text-nowrap">{rdata.findings.overallImpact.industryReadiness.selfReported}% / {rdata.findings.overallImpact.industryReadiness.clientRating}%</h2>
                    <span className="ml-2 text-lg font-semibold">Industry Readiness<br />(self / client)</span>
                </Card>

                {rdata.findings.overallImpact.keyMetrics.map((metric, index) => (
                  (metric.metric === 'Industry Readiness Increase' || metric.metric === 'Data Analysis Skills Improvement') && (
                    <Card key={index} className="flex items-center justify-start p-3">
                      <h2 className="text-3xl font-semibold me-3">{metric.value}%</h2>
                      <ArrowUpCircle style={{ color: colors.primary.lighter }} className="me-3" size={24} />
                      <span className="ml-2 text-lg font-semibold">{metric.metric}</span>
                    </Card>
                  )
                ))}
                {rdata.findings.overallImpact.keyMetrics.map((metric, index) => (
                  (metric.metric === 'Learning Experience Rating' || metric.metric === 'Enhanced Resilience' || metric.metric === 'Student Satisfaction') && (
                    <Card key={index} className="flex items-center justify-start p-3">
                      <h2 className="text-3xl font-semibold me-3">{metric.value}%</h2>
                      <span className="ml-2 text-lg font-semibold">{metric.metric}</span>
                    </Card>
                  )
                ))}
              </div>
          </CardContent>
        </Card>

      {/* Filters */}
      <div className="mb-8">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Filter size={16} />
          Filters
        </button>
        
        {showFilters && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cohort</label>
                  <select 
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Cohorts</option>
                    {mdata.cohorts.map(cohort => (
                      <option key={cohort.key} value={cohort.key}>{cohort.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Skills Impact */}
        <Card>
          <CardHeader>
            <CardTitle>
              {drilldownModule ? `Self-Perception of ${mdata.moduleMetrics.find(module => module.key === drilldownModule).name} Skills` : 'Self-Perception of Skills'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart  className='p-3'
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }} 
                  data={drilldownModule ? skillData : radarData}
                >
                  <PolarGrid gridType="circle" />
                  <PolarAngleAxis dataKey="subject"  />
                  <PolarRadiusAxis angle={45} domain={[1, 5]}/>
                  <Radar 
                    name="Before Module" 
                    dataKey="Before Module" 
                    stroke={colors.primary.main}
                    fill={colors.primary.main}
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="After Module" 
                    dataKey="After Module" 
                    stroke={colors.primary.lighter}
                    fill={colors.primary.lighter}
                    fillOpacity={0.6} 
                  />

                  <Legend wrapperStyle={{ bottom: 0, left: 25 }} />
                  <Tooltip 
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p><strong>{data.subject}</strong></p>
                            <p>{data.description}</p>
                            <p>n: {data.n}</p>
                            <p>p: {data.p}</p>
                            <p>t_stat: {data.t_stat}</p>
                            <p>Effect Size: {data.effect_size}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {mdata.moduleMetrics.map(module => (
                <Button 
                  key={module.key} 
                  onClick={() => setDrilldownModule(module.key)}
                  className={getButtonStyles(drilldownModule === module.key ? 'primary' : 'secondary')}
                >
                  {module.name}
                </Button>
              ))}
              {drilldownModule && (
                <Button 
                  onClick={() => setDrilldownModule(null)}
                  className="bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Back to Modules
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Module Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatModuleData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" interval={0} angle={-15} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ bottom: -50 }}/>
                <Bar dataKey="started" fill={colors.primary.lighter} name="Started" />
                <Bar dataKey="completed" fill={colors.primary.main} name="Completed" />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        </div>
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Education Level</CardTitle>
          </CardHeader>
          <CardContent>
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                    <Pie
                      data={[
                      { name: 'Undergraduate', value: rdata.demographics.undergraduate },
                      { name: 'Postgraduate', value: rdata.demographics.postgraduate }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      fill={ colors.primary.main }
                      label
                    >
                      <Cell key="Undergraduate" fill={colors.primary.main} />
                      <Cell key="Postgraduate" fill={colors.primary.light} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field of Study</CardTitle>
          </CardHeader>
          <CardContent>
                <div>
                  <h3 className="text-lg font-semibold mb-2"></h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                    <Pie
                      data={rdata.demographics.fields}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      fill={ colors.primary.main }
                      label
                    >
                      <Cell key="Business" fill={ colors.primary.main } />
                      <Cell key="Social Services & Public Policy" fill={ colors.primary.darker } />
                      <Cell key="Arts & Humanities" fill={ colors.primary.lighter } />
                      <Cell key="Law" fill={ colors.primary.light } />
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
          </CardContent>
        </Card>
        </div>
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {/* Student Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Student Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select 
                value={selectedModule || 'collaboration'}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {mdata.moduleMetrics.map(module => (
                  <option key={module.key} value={module.key}>{module.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                <ul className="list-disc pl-5">
                  {getFeedbackForModule(selectedModule).map((feedback: string, index: number) => (
                    <li key={index}><i>{feedback}</i></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Improvement Suggestions</h3>
                <ul className="list-disc pl-5">
                  {getImprovementSuggestionsForModule(selectedModule).map((suggestion: string, index: number) => (
                    <li key={index}><i>{suggestion}</i></li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Research Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
                {rdata.recommendations.map((recommendation: any, index: number) => (
                  <div key={index} className='py-2'>
                    <p><strong>{recommendation.area}</strong> </p>
                    <p><i>{recommendation.description}</i></p>
                    <p className='mt-1'>Benefits:</p>
                    <ul className="list-disc pl-5">
                      {recommendation.benefits.map((benefit: any, i: number) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              
            </CardContent>
          </Card>

          {/* Research Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>Research Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              {rdata.limitations.map((limitation: any, index: number) => (
                  <div key={index} className='py-2'>
                    <strong>{limitation.type}</strong>
                    <p>{limitation.description}</p>
                  </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Research References */}
        <Card>
          <CardHeader>
            <CardTitle>Research References</CardTitle>
          </CardHeader>
          <CardContent>
            {rdata.references.map((reference: any, index: number) => (
              <div key={index} className='py-1'>
                    <p className="mb-2"><a href={reference.url} target="_research"><strong>{reference.author} ({reference.year}).</strong> <em>{reference.title}</em></a> {reference.journal} <span className="text-gray-600">[ID: {reference.id}]<br />{reference.relevance}</span></p>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}