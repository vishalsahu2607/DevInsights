export type SourceType =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'markdown'
  | 'code'
  | 'diagram'
  | 'incident'
  | 'repo';

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  project_id: string;
  name: string;
  source_type: SourceType;
  file_path: string;
  status: 'processing' | 'indexed' | 'failed';
  chunk_count: number;
  created_at: string;
  updated_at: string;
  category?: string;
  size_bytes?: number;
}

export interface Repository {
  id: string;
  project_id: string;
  name: string;
  repository_url?: string;
  branch?: string;
  local_path?: string;
  status: 'processing' | 'indexed' | 'failed';
  indexed_file_count: number;
  languages: string[];
  created_at: string;
  updated_at: string;
}

export interface SourceCitation {
  resource_id: string;
  file_name: string;
  file_path: string;
  source_type: SourceType;
  content_preview: string;
  relevance_score: number;
  line_number?: number;
  section_heading?: string;
  function_name?: string;
  repository_name?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: SourceCitation[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface Incident {
  id: string;
  project_id: string;
  title: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_date: string;
  symptoms: string;
  root_cause: string;
  resolution: string;
  prevention: string;
  created_at: string;
}

export interface ArchitectureDiagram {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  extracted_text: string;
  generated_summary: string;
  detected_components: string[];
  detected_services: string[];
  detected_databases: string[];
  detected_apis: string[];
  relationships: string[];
  created_at: string;
}

export interface DashboardStatistics {
  total_resources: number;
  total_repositories: number;
  total_documents: number;
  total_questions: number;
  recent_sources: Resource[];
  recent_chats: ChatSession[];
  indexed_chunks: number;
  system_health: 'healthy' | 'degraded';
}

export interface RAGSettings {
  model_name: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  theme: 'dark' | 'light';
  api_url: string;
}

export interface VectorChunk {
  id: string;
  resource_id: string;
  project_id: string;
  source_type: SourceType;
  file_name: string;
  file_path: string;
  content: string;
  embedding?: number[];
  section_heading?: string;
  line_number?: number;
  repository_name?: string;
  language?: string;
}
