import React, { useState, useEffect } from 'react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  ChevronLeft, ChevronRight, Eye, EyeOff, MessageSquare,
  Play, Pause, SkipBack, SkipForward
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Gradient } from '@/lib/gradient';
import { colors } from '@/lib/colors';
import { getButtonStyles, getChartColors } from '@/lib/colorUtils';
import { ResearchData } from '@/types/data';

export default function PresentationView({ data }: { data: ResearchData }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('right');
  // const [gradientBg, setGradientBg] = useState('');

  useEffect(() => {
    // Create animated gradient background
    const gradient = new Gradient();
    gradient.initGradient('#gradient-canvas');
  }, []);

  const formatSlides = () => {
    return [
      {
        id: 0,
        title: "Title",
        type: "title",
        content: () => (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-full flex flex-col items-center justify-center overflow-hidden"
          >
            <canvas id="gradient-canvas" className="absolute top-0 left-0 w-full h-full opacity-10" />
            
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0,0 L100,100 M100,0 L0,100"
                  stroke={colors.primary.main}
                  strokeWidth="0.5"
                  fill="none"
                />
              </svg>
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="z-10 text-center"
            >
              <motion.h1 
                className="text-7xl font-bold mb-8"
                style={{ color: colors.primary.main }}
              >
                {data.metadata.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl mb-12"
                style={{ color: colors.secondary.main }}
              >
                {data.metadata.subtitle}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 space-y-2"
                style={{ color: colors.secondary.light }}
              >
                <p className="text-xl">{data.metadata.institution}</p>
                <p className="text-xl">{data.metadata.program}</p>
                <p className="text-xl font-semibold">{data.metadata.year}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        ),
        notes: data.metadata.abstract.summary
      },
      {
        id: 1,
        title: "Overview",
        type: "overview",
        content: () => (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-12 h-full"
          >
            <motion.div 
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
                <h2 
                  className="text-4xl font-bold bg-clip-text text-transparent" 
                  style={{ 
                  backgroundImage: `linear-gradient(to right, ${colors.primary.main}, ${colors.primary.darker})`
                  }}
                >
                  Research Overview
                </h2>
                <div className="text-lg">
                <div className="p-6 rounded-xl shadow-inner mb-6" style={{ backgroundColor: colors.primary.lightest }}>
                  <p className="text-2xl font-semibold" style={{ color: colors.primary.main }}>
                  {data.demographics.totalParticipants}
                  <span className="text-lg ml-2" style={{ color: colors.secondary.main }}>Participants</span>
                  </p>
                </div>
                <ul className="space-y-4">
                  {data.metadata.abstract.keyFindings.map((finding: {description: string}, i: number) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: colors.primary.lightest, color: colors.primary.main }}>
                    {i + 1}
                    </span>
                    <p className="text-gray-700" style={{ color: colors.secondary.main }}>{finding.description}</p>
                  </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <motion.div 
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8 }}
              className="h-full"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Undergraduate', value: data.demographics.undergraduate },
                        { name: 'Postgraduate', value: data.demographics.postgraduate }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={colors.primary.main} />
                      <Cell fill={colors.primary.light} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        ),
        notes: `Research conducted with ${data.demographics.totalParticipants} participants across different academic levels and disciplines.`
      },
      {
        id: 2,
        title: "Key Findings",
        type: "findings",
        content: () => (
          <div className="h-full">
            <h2 
              className="text-3xl font-bold mb-6"
              style={{ color: colors.primary.main }}
            >
              Key Metrics
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {data.findings.overallImpact.keyMetrics.map((metric:{metric: string, value: number}, index: number) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow-md border-l-4"
                  style={{ borderColor: getChartColors(index) }}
                >
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: colors.primary.main }}
                  >
                    {metric.value}%
                  </p>
                  <p style={{ color: colors.secondary.main }}>{metric.metric}</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height="50%">
              <BarChart data={data.findings.overallImpact.keyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.secondary.lighter} />
                <XAxis dataKey="metric" tick={{ fill: colors.secondary.main }} />
                <YAxis tick={{ fill: colors.secondary.main }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderColor: colors.primary.light 
                  }}
                />
                <Bar dataKey="value" fill={colors.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
        notes: `Overall impact shows significant improvements across key metrics, with ${data.findings.overallImpact.studentSatisfaction}% student satisfaction.`
      },
      {
        id: 3,
        title: "Module Analysis",
        type: "modules",
        content: () => (
          <div className="h-full">
            <h2 className="text-3xl font-bold mb-6">Module Performance</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl mb-4">Learning Outcomes</h3>
                {Object.entries(data.findings.learningOutcomes.moduleSpecificFindings).map(([module, findings]: [string, {key_improvement: string, statistical_significance: {p_value: string}}]) => (
                  <div key={module} className="mb-4">
                    <p className="font-semibold capitalize">{module}</p>
                    <p className="text-gray-600">Key Improvement: {findings.key_improvement}</p>
                    <p className="text-sm">p-value: {findings.statistical_significance.p_value}</p>
                  </div>
                ))}
              </div>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={Object.entries(data.findings.learningOutcomes.moduleSpecificFindings).map(([key, value]: [string, {key_improvement: string, statistical_significance: {p_value: string, effect_size: number}}]) => ({
                    subject: key.charAt(0).toUpperCase() + key.slice(1),
                    value: value.statistical_significance.effect_size * 100
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="Effect Size" dataKey="value" fill={colors.primary.main} fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ),
        notes: "Module-specific findings show statistically significant improvements across all areas, with particularly strong effects in data science and problem-solving modules."
      },
      {
        id: 4,
        title: "Future Directions",
        type: "recommendations",
        content: () => (
          <div className="h-full">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-8"
              style={{ color: colors.primary.main }}
            >
              Future Directions
            </motion.h2>
            <div className="grid grid-cols-3 gap-6 relative">
              {data.recommendations.map((rec: {area: string, description: string, benefits: string[]}, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-10"
                    style={{ backgroundColor: colors.chart[index % colors.chart.length] }}
                  />
                  <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border-t-4"
                       style={{ borderColor: colors.chart[index % colors.chart.length] }}>
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xl font-bold"
                         style={{ backgroundColor: colors.chart[index % colors.chart.length] }}>
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary.main }}>
                      {rec.area}
                    </h3>
                    <p className="mb-4" style={{ color: colors.secondary.main }}>
                      {rec.description}
                    </p>
                    <ul className="space-y-2">
                      {rec.benefits.map((benefit:string, i:number) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 + i * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.chart[index % colors.chart.length] }} />
                          <span style={{ color: colors.secondary.light }}>{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ),
        notes: "Key recommendations focus on improving data capture, implementing adaptive learning, and establishing long-term tracking mechanisms."
      }
    ];
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (currentSlide < formatSlides().length - 1) {
          setTransitionDirection('right');
          setCurrentSlide(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSlide]);

  const navigateSlide = (direction:string) => {
    setTransitionDirection(direction);
    if (direction === 'right' && currentSlide < formatSlides().length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (direction === 'left' && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slides = formatSlides();

  return (
    <div className="space-y-8">
      {/* Enhanced Presentation Controls */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`p-2 rounded ${getButtonStyles('ghost')}`}
            style={{ color: colors.secondary.main }}
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => navigateSlide('left')}
            className={`p-2 rounded ${getButtonStyles('ghost')}`}
            style={{ color: colors.secondary.main }}
            disabled={currentSlide === 0}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => navigateSlide('right')}
            className={`p-2 rounded ${getButtonStyles('ghost')}`}
            style={{ color: colors.secondary.main }}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentSlide(slides.length - 1)}
            className={`p-2 rounded ${getButtonStyles('ghost')}`}
            style={{ color: colors.secondary.main }}
          >
            <SkipForward size={20} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded ${getButtonStyles('ghost')}`}
            style={{ color: colors.secondary.main }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded ${getButtonStyles('ghost')}`}
            style={{ color: colors.secondary.main }}
          >
            {showNotes ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </motion.div>

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: transitionDirection === 'right' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: transitionDirection === 'right' ? -100 : 100 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-hidden aspect-video bg-white rounded-xl p-8 shadow-lg">
            {slides[currentSlide].content()}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Speaker Notes */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="border-t-4 border-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <MessageSquare size={20} />
                  Speaker Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {slides[currentSlide].notes}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}