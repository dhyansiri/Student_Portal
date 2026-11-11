export type Role = 'user' | 'assistant';

export interface SourceCitation {
  id: string;
  title: string;
  category: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  sender: Role;
  text: string;
  timestamp: string;
  category?: string;
  grounded?: boolean;
  sources?: SourceCitation[];
  feedback?: 'helpful' | 'unhelpful' | null;
  engine?: string;
}

export interface CampusCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  usn?: string;
  created_at?: string;
}

export interface ChatApiResponse {
  success: boolean;
  status: 'success' | 'unknown' | 'unavailable' | 'error' | 'invalid_query';
  mode?: 'rag' | 'conversational';
  reply: string;
  category?: string;
  grounded?: boolean;
  sources?: SourceCitation[];
  engine?: string;
  error?: string;
}
