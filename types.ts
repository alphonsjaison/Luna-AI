
export type Role = 'user' | 'model';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface MessageImage {
  data: string; // base64 string
  mimeType: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
  image?: MessageImage;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
}
