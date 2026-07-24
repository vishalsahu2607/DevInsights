import {
  Project,
  Resource,
  Repository,
  Incident,
  ArchitectureDiagram,
  ChatSession,
  ChatMessage,
  DashboardStatistics,
  RAGSettings,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
}

export async function createProject(name: string, description: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
}

export async function fetchResources(projectId?: string): Promise<Resource[]> {
  const url = projectId ? `${API_BASE}/resources?project_id=${projectId}` : `${API_BASE}/resources`;
  const res = await fetch(url);
  return res.json();
}

export async function deleteResource(id: string): Promise<void> {
  await fetch(`${API_BASE}/resources/${id}`, { method: 'DELETE' });
}

export async function reindexResource(id: string): Promise<void> {
  await fetch(`${API_BASE}/resources/${id}/reindex`, { method: 'POST' });
}

export async function uploadDocument(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/upload/document`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function uploadCodeFile(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/upload/code`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function fetchRepositories(projectId?: string): Promise<Repository[]> {
  const url = projectId ? `${API_BASE}/repositories?project_id=${projectId}` : `${API_BASE}/repositories`;
  const res = await fetch(url);
  return res.json();
}

export async function addGithubRepository(
  projectId: string,
  repositoryUrl: string,
  name?: string,
  branch?: string
): Promise<Repository> {
  const res = await fetch(`${API_BASE}/repositories/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, repository_url: repositoryUrl, name, branch }),
  });
  return res.json();
}

export async function uploadRepositoryZip(formData: FormData): Promise<Repository> {
  const res = await fetch(`${API_BASE}/repositories/zip`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function deleteRepository(id: string): Promise<void> {
  await fetch(`${API_BASE}/repositories/${id}`, { method: 'DELETE' });
}

export async function fetchChatSessions(projectId?: string): Promise<ChatSession[]> {
  const url = projectId ? `${API_BASE}/chat/sessions?project_id=${projectId}` : `${API_BASE}/chat/sessions`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchChatSessionById(id: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/chat/sessions/${id}`);
  return res.json();
}

export async function createChatSession(projectId: string, title?: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, title }),
  });
  return res.json();
}

export async function deleteChatSession(id: string): Promise<void> {
  await fetch(`${API_BASE}/chat/sessions/${id}`, { method: 'DELETE' });
}

export async function sendChatMessage(
  question: string,
  projectId: string,
  sessionId?: string,
  topK: number = 5,
  filePathFilter?: string
): Promise<{ answer: string; session_id: string; sources: any[] }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      project_id: projectId,
      session_id: sessionId,
      top_k: topK,
      file_path_filter: filePathFilter,
    }),
  });
  return res.json();
}

export async function searchRAG(
  query: string,
  projectId?: string,
  filePathFilter?: string,
  topK: number = 5
): Promise<{ results: any[]; results_count: number }> {
  const res = await fetch(`${API_BASE}/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      project_id: projectId,
      file_path_filter: filePathFilter,
      top_k: topK,
    }),
  });
  return res.json();
}

export async function fetchIncidents(projectId?: string): Promise<Incident[]> {
  const url = projectId ? `${API_BASE}/incidents?project_id=${projectId}` : `${API_BASE}/incidents`;
  const res = await fetch(url);
  return res.json();
}

export async function createIncident(incidentData: Partial<Incident>): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData),
  });
  return res.json();
}

export async function deleteIncident(id: string): Promise<void> {
  await fetch(`${API_BASE}/incidents/${id}`, { method: 'DELETE' });
}

export async function fetchArchitecture(projectId?: string): Promise<ArchitectureDiagram[]> {
  const url = projectId ? `${API_BASE}/architecture?project_id=${projectId}` : `${API_BASE}/architecture`;
  const res = await fetch(url);
  return res.json();
}

export async function analyseArchitectureDiagram(formData: FormData): Promise<ArchitectureDiagram> {
  const res = await fetch(`${API_BASE}/architecture/analyse`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function fetchDashboardStatistics(projectId?: string): Promise<DashboardStatistics> {
  const url = projectId ? `${API_BASE}/dashboard/statistics?project_id=${projectId}` : `${API_BASE}/dashboard/statistics`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchSettings(): Promise<RAGSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  return res.json();
}

export async function updateSettings(settings: Partial<RAGSettings>): Promise<RAGSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function resetDemoDataset(): Promise<void> {
  await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
}
