"use client";
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Presentation,
  Download,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { colors } from '@/lib/colors';

// Views
import DashboardView from '@/components/views/DashboardView';
// import TimelineView from '@/components/views/TimelineView';
import PresentationView from '@/components/views/PresentationView';
import DataChatView from '@/components/views/DataChatView';
import { ResearchData, MetricsData } from '@/types/data';

export default function ResearchExplorer({ researchData, metricsData }: { researchData: ResearchData, metricsData: MetricsData }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [rdata, setRData] = useState(researchData);
  const [mdata] = useState(metricsData);
  const [loading, setLoading] = useState(!researchData);

  // Navigation options
  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'presentation', label: 'Presentation', icon: Presentation },
    { id: 'datachat', label: 'Data Chat', icon: MessageSquare }
  ];

  useEffect(() => {
    if (!researchData) {
      const loadData = async () => {
        try {
            const response = await fetch('/api/data');
            const result = await response.json();
            setRData(result);
          setLoading(false);
        } catch (error) {
          console.error('Error loading data:', error);
          setLoading(false);
        }
      };

      loadData();
    }
  }, [researchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading research data...</div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView rdata={rdata} mdata={mdata} />;
      // case 'timeline':
      //   return <TimelineView data={rdata} />;
      case 'presentation':
        return <PresentationView data={rdata} />;
      case 'datachat':
        return <DataChatView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4" >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: colors.primary.main }}
              >
                {rdata.metadata.title}
              </h1>
              <p style={{ color: colors.secondary.darker }}>
                {rdata.metadata.subtitle}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <img src="https://usa.practera.com/img/practera-logo.svg" alt="Practera Logo" className="h-10" />
              <img src="https://www.lse.ac.uk/site-elements/img/lseFull.svg" alt="LSE Logo" className="h-10" />
            </div>
          </div>
          
          {/* View Navigation */}
          <div className="mt-4 flex gap-2">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200"
                style={{ 
                  color: activeView === view.id ? 'white' : colors.secondary.main,
                  backgroundColor: activeView === view.id 
                    ? colors.primary.main 
                    : 'transparent',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: activeView === view.id 
                    ? colors.primary.main 
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeView !== view.id) {
                    e.currentTarget.style.backgroundColor = `${colors.secondary.lighter}20`;
                    e.currentTarget.style.borderColor = colors.secondary.lighter;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== view.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <view.icon size={16} style={{ color: 'currentColor' }} />
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer 
        className="border-t mt-12"
        style={{ backgroundColor: colors.secondary.darker }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p style={{ color: colors.secondary.lighter }}>
              © 2024 {rdata.metadata.institution}
            </p>
            <div className="flex gap-6">
                <a 
                href="/AI_Feedback_Professional_Skills_Development_Paper.pdf" 
                download
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: colors.primary.lighter }}
                >
                <Download size={16} />
                Download Report
                </a>
                <a 
                href="/metrics-data.json" 
                download
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: colors.primary.lighter }}
                >
                <Download size={16} />
                Download Data
                </a>
              <a 
                href="#" 
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: colors.primary.lighter }}
              >
                <ExternalLink size={16} />
                Visit Website
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
