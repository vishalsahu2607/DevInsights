import React, { useState, useEffect } from 'react';
import { NavRoute, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast, ToastMessage } from './components/Toast';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatWindow } from './components/ChatWindow';
import { UploadPage } from './pages/UploadPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';

import {
  Project,
  Resource,
  Repository,
  Incident,
  ArchitectureDiagram,
  ChatSession,
  ChatMessage,
  SourceCitation,
  DashboardStatistics,
  SourceType,
} from './types';

import {
  fetchProjects,
  createProject,
  deleteProject,
  fetchResources,
  deleteResource,
  reindexResource,
  uploadDocument,
  uploadCodeFile,
  fetchRepositories,
  addGithubRepository,
  uploadRepositoryZip,
  deleteRepository,
  fetchChatSessions,
  createChatSession,
  deleteChatSession,
  sendChatMessage,
  fetchIncidents,
  createIncident,
  deleteIncident,
  fetchArchitecture,
  analyseArchitectureDiagram,
  fetchDashboardStatistics,
} from './services/api';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_default');

  const [resources, setResources] = useState<Resource[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [architectureDiagrams, setArchitectureDiagrams] = useState<ArchitectureDiagram[]>([]);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [activeCitations, setActiveCitations] = useState<SourceCitation[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initial data load
  useEffect(() => {
    loadAllData();
  }, [activeProjectId]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ id: Date.now().toString(), type, title, message });
  };

  const loadAllData = async () => {
    try {
      const projList = await fetchProjects();
      setProjects(projList);
      if (projList.length > 0 && (!activeProjectId || !projList.some((p) => p.id === activeProjectId))) {
        setActiveProjectId(projList[0].id);
      }

      const [resList, repoList, incList, archList, chatList, statData] = await Promise.all([
        fetchResources(activeProjectId),
        fetchRepositories(activeProjectId),
        fetchIncidents(activeProjectId),
        fetchArchitecture(activeProjectId),
        fetchChatSessions(activeProjectId),
        fetchDashboardStatistics(activeProjectId),
      ]);

      setResources(resList);
      setRepositories(repoList);
      setIncidents(incList);
      setArchitectureDiagrams(archList);
      setChatSessions(chatList);
      setStats(statData);

      // Select latest session if none selected
      if (chatList.length > 0 && !activeSessionId) {
        setActiveSessionId(chatList[0].id);
        setCurrentMessages(chatList[0].messages || []);
      } else if (chatList.length === 0) {
        // create initial session
        const newSess = await createChatSession(activeProjectId, 'New Exploration Session');
        setChatSessions([newSess]);
        setActiveSessionId(newSess.id);
        setCurrentMessages([]);
      }
    } catch (err) {
      console.error('Failed loading data:', err);
    }
  };

  // Chat actions
  const handleSelectChatSession = (id: string) => {
    setActiveSessionId(id);
    const sess = chatSessions.find((s) => s.id === id);
    if (sess) {
      setCurrentMessages(sess.messages || []);
      const lastAssistantMsg = [...(sess.messages || [])].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg && lastAssistantMsg.sources) {
        setActiveCitations(lastAssistantMsg.sources);
      } else {
        setActiveCitations([]);
      }
    }
  };

  const handleCreateChatSession = async () => {
    try {
      const newSess = await createChatSession(activeProjectId, 'New Exploration Session');
      setChatSessions([newSess, ...chatSessions]);
      setActiveSessionId(newSess.id);
      setCurrentMessages([]);
      setActiveCitations([]);
    } catch (err) {
      showToast('error', 'Failed to create session');
    }
  };

  const handleDeleteChatSession = async (id: string) => {
    try {
      await deleteChatSession(id);
      const remaining = chatSessions.filter((s) => s.id !== id);
      setChatSessions(remaining);
      if (activeSessionId === id) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
          setCurrentMessages(remaining[0].messages || []);
        } else {
          setActiveSessionId(null);
          setCurrentMessages([]);
        }
      }
      showToast('success', 'Chat session deleted');
    } catch (err) {
      showToast('error', 'Failed to delete session');
    }
  };

  const handleSendChatMessage = async (question: string) => {
    if (!question.trim()) return;

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      session_id: activeSessionId || '',
      role: 'user',
      content: question,
      sources: [],
      created_at: new Date().toISOString(),
    };

    setCurrentMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await sendChatMessage(question, activeProjectId, activeSessionId || undefined);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        session_id: res.session_id,
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
        created_at: new Date().toISOString(),
      };

      setCurrentMessages((prev) => [...prev, botMsg]);
      setActiveCitations(res.sources || []);

      // Refresh chat session list
      const updatedSessions = await fetchChatSessions(activeProjectId);
      setChatSessions(updatedSessions);
      if (!activeSessionId) {
        setActiveSessionId(res.session_id);
      }
    } catch (err) {
      showToast('error', 'Failed to generate AI response');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Upload actions
  const handleUploadFile = async (file: File, sourceType: SourceType, category: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', activeProjectId);
      formData.append('category', category);

      if (sourceType === 'code') {
        await uploadCodeFile(formData);
      } else {
        await uploadDocument(formData);
      }

      showToast('success', 'Uploaded & Indexed', `Successfully indexed ${file.name}`);
      await loadAllData();
    } catch (err) {
      showToast('error', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasteContent = async (content: string, fileName: string, sourceType: SourceType, category: string) => {
    setIsUploading(true);
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], fileName);
      await handleUploadFile(file, sourceType, category);
    } catch (err) {
      showToast('error', 'Paste indexing failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Repository actions
  const handleAddGithubRepo = async (url: string, name?: string, branch?: string) => {
    try {
      await addGithubRepository(activeProjectId, url, name, branch);
      showToast('success', 'Repository Indexed', 'GitHub repository successfully parsed');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Failed adding GitHub repo');
    }
  };

  const handleUploadZipRepo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', activeProjectId);
      await uploadRepositoryZip(formData);
      showToast('success', 'Zip Repository Indexed');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Failed indexing zip repo');
    }
  };

  const handleDeleteRepo = async (id: string) => {
    try {
      await deleteRepository(id);
      showToast('success', 'Repository Deleted');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Failed deleting repository');
    }
  };

  // Document actions
  const handleReindexDoc = async (id: string) => {
    try {
      await reindexResource(id);
      showToast('success', 'Document Re-indexed');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Re-index failed');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await deleteResource(id);
      showToast('success', 'Document Deleted');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Delete failed');
    }
  };

  // Incident actions
  const handleCreateIncident = async (incidentData: Partial<Incident>) => {
    try {
      await createIncident({ ...incidentData, project_id: activeProjectId });
      showToast('success', 'Incident Logged & Indexed');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Failed creating incident');
    }
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await deleteIncident(id);
      showToast('success', 'Incident Deleted');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Delete incident failed');
    }
  };

  // Architecture actions
  const handleUploadArchitectureDiagram = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', activeProjectId);
      await analyseArchitectureDiagram(formData);
      showToast('success', 'Diagram Analysed & Indexed');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Diagram analysis failed');
    }
  };

  // Project workspace actions
  const handleCreateProjectWorkspace = async (name: string, description: string) => {
    try {
      const newProj = await createProject(name, description);
      setActiveProjectId(newProj.id);
      showToast('success', 'Workspace Created', `Switched to "${name}"`);
      await loadAllData();
    } catch (err) {
      showToast('error', 'Failed creating project');
    }
  };

  const handleDeleteProjectWorkspace = async (id: string) => {
    try {
      await deleteProject(id);
      showToast('success', 'Workspace Deleted');
      await loadAllData();
    } catch (err) {
      showToast('error', 'Failed deleting project');
    }
  };

  const renderActiveView = () => {
    switch (currentRoute) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentRoute} />;
      case 'dashboard':
        return (
          <DashboardPage
            stats={stats}
            onNavigate={setCurrentRoute}
            onSelectSession={handleSelectChatSession}
          />
        );
      case 'chat':
        return (
          <ChatWindow
            sessions={chatSessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectChatSession}
            onCreateSession={handleCreateChatSession}
            onDeleteSession={handleDeleteChatSession}
            onSendMessage={handleSendChatMessage}
            isLoading={isChatLoading}
            currentMessages={currentMessages}
            activeCitations={activeCitations}
          />
        );
      case 'upload':
        return (
          <UploadPage
            activeProjectId={activeProjectId}
            onUploadFile={handleUploadFile}
            onPasteContent={handlePasteContent}
            isUploading={isUploading}
            onNavigateToDocs={() => setCurrentRoute('documents')}
          />
        );
      case 'repositories':
        return (
          <RepositoriesPage
            repositories={repositories}
            onAddGithubRepo={handleAddGithubRepo}
            onUploadZipRepo={handleUploadZipRepo}
            onDeleteRepo={handleDeleteRepo}
          />
        );
      case 'documents':
        return (
          <DocumentsPage
            resources={resources}
            onReindex={handleReindexDoc}
            onDelete={handleDeleteDoc}
            onNavigateToUpload={() => setCurrentRoute('upload')}
          />
        );
      case 'incidents':
        return (
          <IncidentsPage
            incidents={incidents}
            onCreateIncident={handleCreateIncident}
            onDeleteIncident={handleDeleteIncident}
          />
        );
      case 'architecture':
        return (
          <ArchitecturePage
            diagrams={architectureDiagrams}
            onUploadDiagram={handleUploadArchitectureDiagram}
          />
        );
      case 'projects':
        return (
          <ProjectsPage
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onCreateProject={handleCreateProjectWorkspace}
            onDeleteProject={handleDeleteProjectWorkspace}
          />
        );
      case 'settings':
        return <SettingsPage onSettingsUpdated={loadAllData} />;
      default:
        return <LandingPage onNavigate={setCurrentRoute} />;
    }
  };

  const totalIndexedChunks = resources.reduce((acc, r) => acc + (r.chunk_count || 0), 0);

  return (
    <div className="flex h-screen bg-beige-100 font-sans text-beige-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        indexedChunksCount={totalIndexedChunks || 35}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar
          currentRoute={currentRoute}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onCreateProjectClick={() => setCurrentRoute('projects')}
          onNavigate={setCurrentRoute}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Content View */}
        <main className={`flex-1 overflow-y-auto ${currentRoute === 'chat' ? 'p-0' : 'p-4 md:p-8'}`}>
          {renderActiveView()}
        </main>
      </div>

      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
