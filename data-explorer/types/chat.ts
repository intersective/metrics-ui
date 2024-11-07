export interface SerializableMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  visualizationData?: {
    code: string;
    data: any;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  visualization?: React.ReactNode;
}
