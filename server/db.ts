import fs from 'fs';
import path from 'path';
import {
  Project,
  Resource,
  Repository,
  Incident,
  ArchitectureDiagram,
  ChatSession,
  ChatMessage,
  VectorChunk,
  RAGSettings,
} from '../src/types.js';
import {
  DEFAULT_PROJECT,
  SAMPLE_RESOURCES,
  SAMPLE_REPOSITORIES,
  SAMPLE_INCIDENTS,
  SAMPLE_DIAGRAMS,
  RAW_SAMPLE_CHUNKS,
  INITIAL_CHAT_SESSIONS,
} from './seedData.js';

interface DBState {
  projects: Project[];
  resources: Resource[];
  repositories: Repository[];
  incidents: Incident[];
  diagrams: ArchitectureDiagram[];
  chatSessions: ChatSession[];
  chunks: VectorChunk[];
  settings: RAGSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let dbState: DBState = {
  projects: [DEFAULT_PROJECT],
  resources: [...SAMPLE_RESOURCES],
  repositories: [...SAMPLE_REPOSITORIES],
  incidents: [...SAMPLE_INCIDENTS],
  diagrams: [...SAMPLE_DIAGRAMS],
  chatSessions: [...INITIAL_CHAT_SESSIONS],
  chunks: [],
  settings: {
    model_name: process.env.GEMMA_MODEL_NAME || 'gemma-4',
    embedding_model: process.env.EMBEDDING_MODEL_NAME || 'gemini-embedding-2-preview',
    chunk_size: parseInt(process.env.CHUNK_SIZE || '800'),
    chunk_overlap: parseInt(process.env.CHUNK_OVERLAP || '150'),
    top_k: parseInt(process.env.TOP_K || '5'),
    theme: 'dark',
    api_url: process.env.APP_URL || 'http://localhost:3000/api',
  },
};

export function initDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      if (loaded.projects && loaded.projects.length > 0) {
        dbState = { ...dbState, ...loaded };
      } else {
        saveDB();
      }
    } else {
      saveDB();
    }
    if (!dbState.settings || !dbState.settings.model_name || dbState.settings.model_name.includes('3.6')) {
      dbState.settings = {
        ...dbState.settings,
        model_name: 'gemma-4',
      };
    }
    // Purge any pre-seeded sample chunks so RAG exclusively searches user uploaded/indexed content
    const sampleIds = new Set(RAW_SAMPLE_CHUNKS.map((c) => c.id));
    dbState.chunks = (dbState.chunks || []).filter(
      (c) =>
        !sampleIds.has(c.id) &&
        !c.id.startsWith('chunk-auth-') &&
        !c.id.startsWith('chunk-pay-') &&
        !c.id.startsWith('chunk-check-') &&
        !c.id.startsWith('chunk-inc-') &&
        !c.id.startsWith('chunk-diag-') &&
        !c.id.startsWith('chunk-arch-')
    );
    saveDB();
  } catch (err) {
    console.error('Failed to load db.json:', err);
    dbState.chunks = [];
    saveDB();
  }
}

export function saveDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

export function resetDB() {
  dbState = {
    projects: [DEFAULT_PROJECT],
    resources: [],
    repositories: [],
    incidents: [],
    diagrams: [],
    chatSessions: [...INITIAL_CHAT_SESSIONS],
    chunks: [],
    settings: {
      model_name: process.env.GEMMA_MODEL_NAME || 'gemini-2.5-flash',
      embedding_model: process.env.EMBEDDING_MODEL_NAME || 'gemini-embedding-2-preview',
      chunk_size: parseInt(process.env.CHUNK_SIZE || '800'),
      chunk_overlap: parseInt(process.env.CHUNK_OVERLAP || '150'),
      top_k: parseInt(process.env.TOP_K || '5'),
      theme: 'dark',
      api_url: process.env.APP_URL || 'http://localhost:3000/api',
    },
  };
  saveDB();
  return dbState;
}

export function getProjects(): Project[] {
  return dbState.projects;
}

export function getProjectById(id: string): Project | undefined {
  return dbState.projects.find((p) => p.id === id);
}

export function addProject(name: string, description: string): Project {
  const newProj: Project = {
    id: `proj-${Date.now()}`,
    name,
    description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dbState.projects.push(newProj);
  saveDB();
  return newProj;
}

export function updateProject(id: string, name: string, description: string): Project | undefined {
  const proj = dbState.projects.find((p) => p.id === id);
  if (proj) {
    proj.name = name;
    proj.description = description;
    proj.updated_at = new Date().toISOString();
    saveDB();
  }
  return proj;
}

export function deleteProject(id: string): boolean {
  const initialLen = dbState.projects.length;
  dbState.projects = dbState.projects.filter((p) => p.id !== id);
  if (dbState.projects.length < initialLen) {
    dbState.resources = dbState.resources.filter((r) => r.project_id !== id);
    dbState.repositories = dbState.repositories.filter((r) => r.project_id !== id);
    dbState.incidents = dbState.incidents.filter((i) => i.project_id !== id);
    dbState.diagrams = dbState.diagrams.filter((d) => d.project_id !== id);
    dbState.chunks = dbState.chunks.filter((c) => c.project_id !== id);
    saveDB();
    return true;
  }
  return false;
}

export function getResources(projectId?: string): Resource[] {
  if (projectId) {
    return dbState.resources.filter((r) => r.project_id === projectId);
  }
  return dbState.resources;
}

export function getResourceById(id: string): Resource | undefined {
  return dbState.resources.find((r) => r.id === id);
}

export function addResource(res: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Resource {
  const newRes: Resource = {
    ...res,
    id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dbState.resources.push(newRes);
  saveDB();
  return newRes;
}

export function deleteResource(id: string): boolean {
  const len = dbState.resources.length;
  dbState.resources = dbState.resources.filter((r) => r.id !== id);
  dbState.chunks = dbState.chunks.filter((c) => c.resource_id !== id);
  saveDB();
  return dbState.resources.length < len;
}

export function getRepositories(projectId?: string): Repository[] {
  if (projectId) {
    return dbState.repositories.filter((r) => r.project_id === projectId);
  }
  return dbState.repositories;
}

export function addRepository(repo: Omit<Repository, 'id' | 'created_at' | 'updated_at'>): Repository {
  const newRepo: Repository = {
    ...repo,
    id: `repo-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dbState.repositories.push(newRepo);
  saveDB();
  return newRepo;
}

export function deleteRepository(id: string): boolean {
  const repo = dbState.repositories.find((r) => r.id === id);
  const len = dbState.repositories.length;
  dbState.repositories = dbState.repositories.filter((r) => r.id !== id);
  if (repo) {
    const repoNameLower = repo.name.toLowerCase();
    dbState.resources = dbState.resources.filter(
      (res) => !res.name.toLowerCase().includes(repoNameLower) && !res.category.toLowerCase().includes(repoNameLower)
    );
    dbState.chunks = dbState.chunks.filter(
      (c) => !c.file_path.toLowerCase().includes(repoNameLower) && !c.file_name.toLowerCase().includes(repoNameLower)
    );
  }
  saveDB();
  return dbState.repositories.length < len;
}

export function getIncidents(projectId?: string): Incident[] {
  if (projectId) {
    return dbState.incidents.filter((i) => i.project_id === projectId);
  }
  return dbState.incidents;
}

export function addIncident(inc: Omit<Incident, 'id' | 'created_at'>): Incident {
  const newInc: Incident = {
    ...inc,
    id: `inc-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  dbState.incidents.push(newInc);
  saveDB();
  return newInc;
}

export function deleteIncident(id: string): boolean {
  const len = dbState.incidents.length;
  dbState.incidents = dbState.incidents.filter((i) => i.id !== id);
  saveDB();
  return dbState.incidents.length < len;
}

export function getDiagrams(projectId?: string): ArchitectureDiagram[] {
  if (projectId) {
    return dbState.diagrams.filter((d) => d.project_id === projectId);
  }
  return dbState.diagrams;
}

export function addDiagram(diag: Omit<ArchitectureDiagram, 'id' | 'created_at'>): ArchitectureDiagram {
  const newDiag: ArchitectureDiagram = {
    ...diag,
    id: `diag-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  dbState.diagrams.push(newDiag);
  saveDB();
  return newDiag;
}

export function getChatSessions(projectId?: string): ChatSession[] {
  if (projectId) {
    return dbState.chatSessions.filter((s) => s.project_id === projectId);
  }
  return dbState.chatSessions;
}

export function getChatSessionById(id: string): ChatSession | undefined {
  return dbState.chatSessions.find((s) => s.id === id);
}

export function createChatSession(projectId: string, title?: string): ChatSession {
  const newSession: ChatSession = {
    id: `session-${Date.now()}`,
    project_id: projectId,
    title: title || 'New Conversation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [],
  };
  dbState.chatSessions.unshift(newSession);
  saveDB();
  return newSession;
}

export function addChatMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage {
  let session = dbState.chatSessions.find((s) => s.id === sessionId);
  if (!session) {
    session = createChatSession('proj-ecommerce-001', message.content.slice(0, 30) + '...');
  }
  if (!session.messages) session.messages = [];

  const newMsg: ChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    created_at: new Date().toISOString(),
  };

  session.messages.push(newMsg);
  session.updated_at = new Date().toISOString();
  if (session.messages.length === 1 && message.role === 'user') {
    session.title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
  }
  saveDB();
  return newMsg;
}

export function deleteChatSession(id: string): boolean {
  const len = dbState.chatSessions.length;
  dbState.chatSessions = dbState.chatSessions.filter((s) => s.id !== id);
  saveDB();
  return dbState.chatSessions.length < len;
}

export function addChunks(chunks: VectorChunk[]) {
  dbState.chunks.push(...chunks);
  saveDB();
}

export function getChunks(projectId?: string): VectorChunk[] {
  if (projectId) {
    return dbState.chunks.filter((c) => c.project_id === projectId);
  }
  return dbState.chunks;
}

export function getSettings(): RAGSettings {
  return dbState.settings;
}

export function updateSettings(newSettings: Partial<RAGSettings>): RAGSettings {
  dbState.settings = { ...dbState.settings, ...newSettings };
  saveDB();
  return dbState.settings;
}
