import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { colors } from '@/lib/colors';
import { motion, AnimatePresence } from 'framer-motion';
import * as Babel from '@babel/standalone';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/types/chat';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const transformChartData = (data: any[], chartCode: string): ChartData[] => {
  try {
    // Detect chart type from the code
    const chartType = chartCode.includes('PieChart') ? 'pie' :
                     chartCode.includes('BarChart') ? 'bar' :
                     chartCode.includes('LineChart') ? 'line' :
                     chartCode.includes('RadarChart') ? 'radar' : 'unknown';

    // Transform data based on chart type
    switch (chartType) {
      case 'pie':
        return data.map(item => ({
          name: String(item.name || item.label || item.category || Object.keys(item)[0]),
          value: Number(item.value || item.count || item.amount || Object.values(item)[0])
        }));

      case 'bar':
      case 'line':
        return data.map(item => {
          const entry: ChartData = {
            name: String(item.name || item.label || item.category || Object.keys(item)[0]),
            value: Number(item.value || item.count || item.amount || Object.values(item)[0])
          };
          // Include additional numeric properties
          Object.entries(item).forEach(([key, val]) => {
            if (typeof val === 'number' && key !== 'value') {
              entry[key] = val;
            }
          });
          return entry;
        });

      case 'radar':
        return data.map(item => {
          const entry: ChartData = { name: '', value: 0 };
          Object.entries(item).forEach(([key, val]) => {
            if (typeof val === 'number') {
              entry[key] = val;
            } else if (typeof val === 'string' && !entry.name) {
              entry.name = val;
            }
          });
          return entry;
        });

      default:
        return data;
    }
  } catch (error) {
    console.error('Error transforming data:', error);
    return data;
  }
};

// Add this function to safely evaluate JSX code
const createComponentFromJSX = (code: string, chartData: any) => {
  try {
    // Add debug logging
    console.log('Creating component from code:', code);
    console.log('With data:', chartData);
    
    // Remove escaped quotes and newlines
    const cleanCode = code.replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Transform JSX to JavaScript
    const transformed = Babel.transform(cleanCode, {
      presets: ['react']
    }).code;

    // Create a function that returns the component
    const createComponent = new Function(
      'React',
      'ResponsiveContainer',
      'PieChart',
      'Pie',
      'Cell',
      'Tooltip',
      'BarChart',
      'Bar',
      'XAxis',
      'YAxis',
      'CartesianGrid',
      'Legend',
      'LineChart',
      'Line',
      'RadarChart',
      'Radar',
      'PolarGrid',
      'PolarAngleAxis',
      'PolarRadiusAxis',
      'data',
      `return ${transformed}`
    );

    // Execute the function with dependencies
    const component = createComponent(
      React,
      ResponsiveContainer,
      PieChart,
      Pie,
      Cell,
      Tooltip,
      BarChart,
      Bar,
      XAxis,
      YAxis,
      CartesianGrid,
      Legend,
      LineChart,
      Line,
      RadarChart,
      Radar,
      PolarGrid,
      PolarAngleAxis,
      PolarRadiusAxis,
      chartData
    );
    
    console.log('Component created:', component);
    return component;
  } catch (error) {
    console.error('Error creating component:', error);
    return null;
  }
};

export default function DataChatView() {
  const { 
    messages: serializedMessages, 
    addMessage, 
    clearMessages, 
    threadId, 
    setThreadId,
    isLoading,
    setLoading,
    pendingRequest,
    setPending 
  } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Check for pending request on mount
  useEffect(() => {
    const checkPending = async () => {
      if (pendingRequest) {
        await handleChatRequest(pendingRequest.message);
      }
    };
    checkPending();
  }, []);

  // Hydrate messages with visualizations on mount and when serialized messages change
  useEffect(() => {
    const hydratedMessages = serializedMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      visualization: msg.visualizationData ? 
        createComponentFromJSX(
          msg.visualizationData.code,
          transformChartData(msg.visualizationData.data, msg.visualizationData.code)
        ) : undefined
    }));
    setMessages(hydratedMessages);
  }, [serializedMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleChatRequest = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          threadId: threadId || '' 
        }),
      });

      const parsed = await response.json();
      if (!parsed) {
        throw new Error('No response from assistant');
      }
      if (!threadId && parsed[0].thread_id) {
        setThreadId(parsed[0].thread_id);
      }
      
      const data = parsed[parsed.length - 1];
      
      if (data.code && data.data) {
        const rawData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        const transformedData = transformChartData(rawData, data.code);
        const viz = createComponentFromJSX(data.code, transformedData);
        
        addMessage({
          role: 'assistant',
          content: data.answer || 'No answer provided',
          timestamp: new Date(),
          visualization: viz
        }, {
          code: data.code,
          data: rawData
        });
      } else {
        addMessage({
          role: 'assistant',
          content: data.answer || 'No answer provided',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setPending(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setPending(input);
    
    await handleChatRequest(input);
  };

  const handleClear = () => {
    clearMessages(); // This now also clears threadId
  };

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg mr-4 p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gray-100 ml-auto max-w-[80%]' 
                    : 'bg-blue-50 mr-auto max-w-[80%]'
                }`}
              >
                <p style={{ color: colors.secondary.main }}>{message.content}</p>
                {/* {message.visualization && (
                  <div className="mt-4 h-64 w-full">
                    {message.visualization}
                  </div>
                )} */}
                <p className="text-xs mt-2" style={{ color: colors.secondary.light }}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the research data..."
            className="flex-1 p-2 border rounded-lg"
            style={{ borderColor: colors.secondary.lighter }}
          />
          <button
            type="submit"
            disabled={isLoading}  // now using store's loading state
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ 
              backgroundColor: colors.primary.main,
              color: 'white'
            }}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ 
              backgroundColor: colors.secondary.main,
              color: 'white'
            }}
          >
            <Trash2 />
          </button>
        </form>
      </div>

      {/* Visualization Panel */}
      <div className="w-1/2 bg-white rounded-lg shadow-lg p-4">
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: colors.primary.main }}
        >
          Data Visualization
        </h2>
        {messages.length > 0 && messages[messages.length - 1].visualization ? (
          <div style={{ width: '100%', height: 'calc(100% - 3rem)' }}>
            {messages[messages.length - 1].visualization}
          </div>
        ) : (
          <div 
            className="h-full flex items-center justify-center text-center p-8"
            style={{ color: colors.secondary.light }}
          >
            <p>Ask questions about the research data to see visualizations here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
