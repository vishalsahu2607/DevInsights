import { randomUUID } from "node:crypto";
import { loadState, saveState } from "./stateStore.js";
import type {
  Project,
  Resource,
  Repository,
  Incident,
  ArchitectureDiagram,
  ChatSession,
  ChatMessage,
  VectorChunk,
  RAGSettings,
} from "../src/types.js";
import {
  DEFAULT_PROJECT,
  SAMPLE_RESOURCES,
  SAMPLE_REPOSITORIES,
  SAMPLE_INCIDENTS,
  SAMPLE_DIAGRAMS,
  RAW_SAMPLE_CHUNKS,
  INITIAL_CHAT_SESSIONS,
} from "./seedData.js";

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

const STATE_ID = "devinsights-main";

function getEnvironmentNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number.parseInt(value || "", 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function createDefaultSettings(): RAGSettings {
  return {
    model_name:
      process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash",

    embedding_model:
      process.env.EMBEDDING_MODEL_NAME ||
      "gemini-embedding-2-preview",

    chunk_size: getEnvironmentNumber(
      process.env.CHUNK_SIZE,
      800,
    ),

    chunk_overlap: getEnvironmentNumber(
      process.env.CHUNK_OVERLAP,
      150,
    ),

    top_k: getEnvironmentNumber(
      process.env.TOP_K,
      5,
    ),

    theme: "dark",

    api_url: process.env.APP_URL || "/api",
  };
}

function createInitialState(): DBState {
  return {
    projects: [DEFAULT_PROJECT],
    resources: [...SAMPLE_RESOURCES],
    repositories: [...SAMPLE_REPOSITORIES],
    incidents: [...SAMPLE_INCIDENTS],
    diagrams: [...SAMPLE_DIAGRAMS],
    chatSessions: [...INITIAL_CHAT_SESSIONS],
    chunks: [],
    settings: createDefaultSettings(),
  };
}

function createResetState(): DBState {
  return {
    projects: [DEFAULT_PROJECT],
    resources: [],
    repositories: [],
    incidents: [],
    diagrams: [],
    chatSessions: [...INITIAL_CHAT_SESSIONS],
    chunks: [],
    settings: createDefaultSettings(),
  };
}

let dbState: DBState = createInitialState();

function copyValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function removeSeedChunks(chunks: VectorChunk[]): VectorChunk[] {
  const sampleIds = new Set(RAW_SAMPLE_CHUNKS.map((chunk) => chunk.id));

  return chunks.filter(
    (chunk) =>
      !sampleIds.has(chunk.id) &&
      !chunk.id.startsWith("chunk-auth-") &&
      !chunk.id.startsWith("chunk-pay-") &&
      !chunk.id.startsWith("chunk-check-") &&
      !chunk.id.startsWith("chunk-inc-") &&
      !chunk.id.startsWith("chunk-diag-") &&
      !chunk.id.startsWith("chunk-arch-"),
  );
}

function normalizeState(savedState: DBState): DBState {
  const defaults = createInitialState();
  const savedSettings = savedState.settings || defaults.settings;
  const savedModelName = savedSettings.model_name || defaults.settings.model_name;

  const shouldReplaceModel =
    savedModelName.includes("3.6") || savedModelName.includes("gemma");

  return {
    projects: Array.isArray(savedState.projects)
      ? savedState.projects
      : defaults.projects,
    resources: Array.isArray(savedState.resources)
      ? savedState.resources
      : defaults.resources,
    repositories: Array.isArray(savedState.repositories)
      ? savedState.repositories
      : defaults.repositories,
    incidents: Array.isArray(savedState.incidents)
      ? savedState.incidents
      : defaults.incidents,
    diagrams: Array.isArray(savedState.diagrams)
      ? savedState.diagrams
      : defaults.diagrams,
    chatSessions: Array.isArray(savedState.chatSessions)
      ? savedState.chatSessions
      : defaults.chatSessions,
    chunks: removeSeedChunks(
      Array.isArray(savedState.chunks) ? savedState.chunks : [],
    ),
    settings: {
      ...defaults.settings,
      ...savedSettings,
      model_name: shouldReplaceModel
        ? defaults.settings.model_name
        : savedModelName,
    },
  };
}

async function persistDatabase(): Promise<void> {
  await saveState(STATE_ID, dbState);
}

/**
 * Reads the latest state before every operation. This is safer on Vercel,
 * where multiple serverless instances may be running independently.
 */
async function refreshDatabase(): Promise<void> {
  const savedState = await loadState<DBState>(STATE_ID);

  if (!savedState) {
    dbState = createInitialState();
    await persistDatabase();
    return;
  }

  const normalizedState = normalizeState(savedState);
  const changed =
    JSON.stringify(normalizedState) !== JSON.stringify(savedState);

  dbState = normalizedState;

  if (changed) {
    await persistDatabase();
  }
}

export async function initDB(): Promise<void> {
  await refreshDatabase();
}

export async function saveDB(): Promise<void> {
  await persistDatabase();
}

export async function resetDB(): Promise<DBState> {
  dbState = createResetState();
  await persistDatabase();
  return copyValue(dbState);
}

export async function getProjects(): Promise<Project[]> {
  await refreshDatabase();
  return copyValue(dbState.projects);
}

export async function getProjectById(
  id: string,
): Promise<Project | undefined> {
  await refreshDatabase();
  const project = dbState.projects.find((item) => item.id === id);
  return project ? copyValue(project) : undefined;
}

export async function addProject(
  name: string,
  description: string,
): Promise<Project> {
  await refreshDatabase();

  const cleanName = name.trim();
  const cleanDescription = description ? description.trim() : "";
  const now = new Date().toISOString();
  const timestamp = Date.now();
  const projectId = `proj-${randomUUID()}`;
  const sessionId = `session-${randomUUID()}`;

  const newProject: Project = {
    id: projectId,
    name: cleanName,
    description: cleanDescription,
    created_at: now,
    updated_at: now,
  };

  const defaultSession: ChatSession = {
    id: sessionId,
    project_id: projectId,
    title: `${cleanName} Workspace`,
    messages: [
      {
        id: `msg-${timestamp}`,
        session_id: sessionId,
        role: "assistant",
        content: `Welcome to **${cleanName}**! Workspace initialized successfully. You can now upload codebase archives, link GitHub repositories, or add architectural documentation to perform precise RAG queries across this project.`,
        sources: [],
        created_at: now,
      },
    ],
    created_at: now,
    updated_at: now,
  };

  dbState.projects.push(newProject);
  dbState.chatSessions.push(defaultSession);
  await persistDatabase();

  return copyValue(newProject);
}

export async function updateProject(
  id: string,
  name: string,
  description: string,
): Promise<Project | undefined> {
  await refreshDatabase();

  const project = dbState.projects.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.name = name.trim();
  project.description = description ? description.trim() : "";
  project.updated_at = new Date().toISOString();

  await persistDatabase();
  return copyValue(project);
}

export async function deleteProject(id: string): Promise<boolean> {
  await refreshDatabase();

  const initialLength = dbState.projects.length;
  dbState.projects = dbState.projects.filter((project) => project.id !== id);

  const deleted = dbState.projects.length < initialLength;

  if (!deleted) {
    return false;
  }

  dbState.resources = dbState.resources.filter(
    (resource) => resource.project_id !== id,
  );
  dbState.repositories = dbState.repositories.filter(
    (repository) => repository.project_id !== id,
  );
  dbState.incidents = dbState.incidents.filter(
    (incident) => incident.project_id !== id,
  );
  dbState.diagrams = dbState.diagrams.filter(
    (diagram) => diagram.project_id !== id,
  );
  dbState.chatSessions = dbState.chatSessions.filter(
    (session) => session.project_id !== id,
  );
  dbState.chunks = dbState.chunks.filter((chunk) => chunk.project_id !== id);

  await persistDatabase();
  return true;
}

export async function getResources(projectId?: string): Promise<Resource[]> {
  await refreshDatabase();

  const resources = projectId
    ? dbState.resources.filter((resource) => resource.project_id === projectId)
    : dbState.resources;

  return copyValue(resources);
}

export async function getResourceById(
  id: string,
): Promise<Resource | undefined> {
  await refreshDatabase();
  const resource = dbState.resources.find((item) => item.id === id);
  return resource ? copyValue(resource) : undefined;
}

export async function addResource(
  resource: Omit<Resource, "id" | "created_at" | "updated_at">,
): Promise<Resource> {
  await refreshDatabase();

  const now = new Date().toISOString();
  const newResource: Resource = {
    ...resource,
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: now,
    updated_at: now,
  };

  dbState.resources.push(newResource);
  await persistDatabase();

  return copyValue(newResource);
}

export async function deleteResource(id: string): Promise<boolean> {
  await refreshDatabase();

  const initialLength = dbState.resources.length;
  dbState.resources = dbState.resources.filter(
    (resource) => resource.id !== id,
  );

  const deleted = dbState.resources.length < initialLength;

  if (!deleted) {
    return false;
  }

  dbState.chunks = dbState.chunks.filter((chunk) => chunk.resource_id !== id);
  await persistDatabase();

  return true;
}

export async function getRepositories(
  projectId?: string,
): Promise<Repository[]> {
  await refreshDatabase();

  const repositories = projectId
    ? dbState.repositories.filter(
        (repository) => repository.project_id === projectId,
      )
    : dbState.repositories;

  return copyValue(repositories);
}

export async function addRepository(
  repository: Omit<Repository, "id" | "created_at" | "updated_at">,
): Promise<Repository> {
  await refreshDatabase();

  const now = new Date().toISOString();
  const newRepository: Repository = {
    ...repository,
    id: `repo-${randomUUID()}`,
    created_at: now,
    updated_at: now,
  };

  dbState.repositories.push(newRepository);
  await persistDatabase();

  return copyValue(newRepository);
}

export async function deleteRepository(id: string): Promise<boolean> {
  await refreshDatabase();

  const repository = dbState.repositories.find((item) => item.id === id);

  if (!repository) {
    return false;
  }

  dbState.repositories = dbState.repositories.filter(
    (item) => item.id !== id,
  );

  const repositoryName = repository.name.toLowerCase();

  dbState.resources = dbState.resources.filter((resource) => {
    const name = resource.name?.toLowerCase() || "";
    const category = resource.category?.toLowerCase() || "";
    return !name.includes(repositoryName) && !category.includes(repositoryName);
  });

  dbState.chunks = dbState.chunks.filter((chunk) => {
    const filePath = chunk.file_path?.toLowerCase() || "";
    const fileName = chunk.file_name?.toLowerCase() || "";
    return (
      !filePath.includes(repositoryName) &&
      !fileName.includes(repositoryName)
    );
  });

  await persistDatabase();
  return true;
}

export async function getIncidents(projectId?: string): Promise<Incident[]> {
  await refreshDatabase();

  const incidents = projectId
    ? dbState.incidents.filter((incident) => incident.project_id === projectId)
    : dbState.incidents;

  return copyValue(incidents);
}

export async function addIncident(
  incident: Omit<Incident, "id" | "created_at">,
): Promise<Incident> {
  await refreshDatabase();

  const newIncident: Incident = {
    ...incident,
    id: `inc-${randomUUID()}`,
    created_at: new Date().toISOString(),
  };

  dbState.incidents.push(newIncident);
  await persistDatabase();

  return copyValue(newIncident);
}

export async function deleteIncident(id: string): Promise<boolean> {
  await refreshDatabase();

  const initialLength = dbState.incidents.length;
  dbState.incidents = dbState.incidents.filter(
    (incident) => incident.id !== id,
  );

  const deleted = dbState.incidents.length < initialLength;

  if (deleted) {
    await persistDatabase();
  }

  return deleted;
}

export async function getDiagrams(
  projectId?: string,
): Promise<ArchitectureDiagram[]> {
  await refreshDatabase();

  const diagrams = projectId
    ? dbState.diagrams.filter((diagram) => diagram.project_id === projectId)
    : dbState.diagrams;

  return copyValue(diagrams);
}

export async function addDiagram(
  diagram: Omit<ArchitectureDiagram, "id" | "created_at">,
): Promise<ArchitectureDiagram> {
  await refreshDatabase();

  const newDiagram: ArchitectureDiagram = {
    ...diagram,
    id: `diag-${randomUUID()}`,
    created_at: new Date().toISOString(),
  };

  dbState.diagrams.push(newDiagram);
  await persistDatabase();

  return copyValue(newDiagram);
}

export async function getChatSessions(
  projectId?: string,
): Promise<ChatSession[]> {
  await refreshDatabase();

  const sessions = projectId
    ? dbState.chatSessions.filter((session) => session.project_id === projectId)
    : dbState.chatSessions;

  return copyValue(sessions);
}

export async function getChatSessionById(
  id: string,
): Promise<ChatSession | undefined> {
  await refreshDatabase();
  const session = dbState.chatSessions.find((item) => item.id === id);
  return session ? copyValue(session) : undefined;
}

export async function createChatSession(
  projectId: string,
  title?: string,
): Promise<ChatSession> {
  await refreshDatabase();

  const now = new Date().toISOString();
  const newSession: ChatSession = {
    id: `session-${randomUUID()}`,
    project_id: projectId,
    title: title || "New Conversation",
    created_at: now,
    updated_at: now,
    messages: [],
  };

  dbState.chatSessions.unshift(newSession);
  await persistDatabase();

  return copyValue(newSession);
}

export async function addChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, "id" | "created_at">,
): Promise<ChatMessage> {
  await refreshDatabase();

  let session = dbState.chatSessions.find((item) => item.id === sessionId);

  if (!session) {
    const now = new Date().toISOString();
    const fallbackProjectId =
      dbState.projects[0]?.id || DEFAULT_PROJECT.id || "proj-default";

    session = {
      id: sessionId || `session-${Date.now()}`,
      project_id: fallbackProjectId,
      title: `${message.content.slice(0, 30)}...`,
      created_at: now,
      updated_at: now,
      messages: [],
    };

    dbState.chatSessions.unshift(session);
  }

  if (!session.messages) {
    session.messages = [];
  }

  const newMessage: ChatMessage = {
    ...message,
    session_id: session.id,
    id: `msg-${randomUUID()}`,
    created_at: new Date().toISOString(),
  };

  session.messages.push(newMessage);
  session.updated_at = new Date().toISOString();

  if (session.messages.length === 1 && message.role === "user") {
    session.title =
      message.content.slice(0, 40) +
      (message.content.length > 40 ? "..." : "");
  }

  await persistDatabase();
  return copyValue(newMessage);
}

export async function deleteChatSession(id: string): Promise<boolean> {
  await refreshDatabase();

  const initialLength = dbState.chatSessions.length;
  dbState.chatSessions = dbState.chatSessions.filter(
    (session) => session.id !== id,
  );

  const deleted = dbState.chatSessions.length < initialLength;

  if (deleted) {
    await persistDatabase();
  }

  return deleted;
}

export async function addChunks(chunks: VectorChunk[]): Promise<void> {
  await refreshDatabase();
  dbState.chunks.push(...chunks);
  await persistDatabase();
}

export async function getChunks(projectId?: string): Promise<VectorChunk[]> {
  await refreshDatabase();

  const chunks = projectId
    ? dbState.chunks.filter((chunk) => chunk.project_id === projectId)
    : dbState.chunks;

  return copyValue(chunks);
}

export async function getSettings(): Promise<RAGSettings> {
  await refreshDatabase();
  return copyValue(dbState.settings);
}

export async function updateSettings(
  newSettings: Partial<RAGSettings>,
): Promise<RAGSettings> {
  await refreshDatabase();

  dbState.settings = {
    ...dbState.settings,
    ...newSettings,
  };

  await persistDatabase();
  return copyValue(dbState.settings);
}