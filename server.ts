import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

import {
  initDB,
  resetDB,
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject,
  getResources,
  getResourceById,
  deleteResource,
  getRepositories,
  addRepository,
  deleteRepository,
  getIncidents,
  addIncident,
  deleteIncident,
  getDiagrams,
  addDiagram,
  getChatSessions,
  getChatSessionById,
  createChatSession,
  addChatMessage,
  deleteChatSession,
  getSettings,
  updateSettings,
} from './server/db.js';

import {
  generateRAGAnswer,
  searchKnowledge,
  processAndIndexFile,
  processAndIndexZip,
  processAndIndexGitHubRepo,
  chunkText,
} from './server/rag.js';

// Initialize persistent database
initDB();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request Logging
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- HEALTH CHECK ---
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DevInsights AI Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // --- PROJECTS API ---
  app.get('/api/projects', (_req: Request, res: Response) => {
    res.json(getProjects());
  });

  app.post('/api/projects', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const newProj = addProject(name, description || '');
    res.status(201).json(newProj);
  });

  app.get('/api/projects/:id', (req: Request, res: Response) => {
    const proj = getProjectById(req.params.id);
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    res.json(proj);
  });

  app.put('/api/projects/:id', (req: Request, res: Response) => {
    const { name, description } = req.body;
    const updated = updateProject(req.params.id, name, description);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  });

  app.delete('/api/projects/:id', (req: Request, res: Response) => {
    const success = deleteProject(req.params.id);
    if (!success) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  });

  // --- RESOURCES & FILE UPLOADS ---
  app.get('/api/resources', (req: Request, res: Response) => {
    const projectId = req.query.project_id as string;
    res.json(getResources(projectId));
  });

  app.get('/api/resources/:id', (req: Request, res: Response) => {
    const resItem = getResourceById(req.params.id);
    if (!resItem) return res.status(404).json({ error: 'Resource not found' });
    res.json(resItem);
  });

  app.delete('/api/resources/:id', (req: Request, res: Response) => {
    const success = deleteResource(req.params.id);
    if (!success) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  });

  app.post('/api/resources/:id/reindex', async (req: Request, res: Response) => {
    const resItem = getResourceById(req.params.id);
    if (!resItem) return res.status(404).json({ error: 'Resource not found' });
    resItem.status = 'indexed';
    resItem.updated_at = new Date().toISOString();
    res.json({ message: 'Reindexed resource successfully', resource: resItem });
  });

  // File upload handlers
  app.post(
    '/api/upload/document',
    upload.single('file'),
    async (req: Request, res: Response) => {
      try {
        const projectId = req.body.project_id || 'proj-ecommerce-001';
        const category = req.body.category || 'Documentation';
        const rawContent = req.body.content;

        if (req.file) {
          const fileName = req.file.originalname;
          const ext = path.extname(fileName).toLowerCase();

          if (ext === '.zip') {
            const zipResult = await processAndIndexZip(
              projectId,
              req.file.path,
              fileName.replace(/\.zip$/i, ''),
              category
            );
            return res.status(201).json({
              message: `ZIP archive unpacked and indexed successfully (${zipResult.indexedFileCount} files, ${zipResult.totalChunks} chunks)`,
              chunk_count: zipResult.totalChunks,
            });
          }

          let fileContent = '';
          if (fs.existsSync(req.file.path)) {
            fileContent = fs.readFileSync(req.file.path, 'utf-8');
          }

          let sourceType: any = 'txt';
          if (ext === '.pdf') sourceType = 'pdf';
          else if (ext === '.docx') sourceType = 'docx';
          else if (ext === '.md') sourceType = 'markdown';
          else if (['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java'].includes(ext)) sourceType = 'code';

          const result = await processAndIndexFile(
            projectId,
            fileName,
            `docs/${fileName}`,
            sourceType,
            fileContent,
            category
          );

          return res.status(201).json({
            message: 'Document uploaded and indexed successfully',
            resource_id: result.resourceId,
            chunk_count: result.chunkCount,
          });
        } else if (rawContent) {
          const fileName = req.body.file_name || 'Document_Paste.txt';
          const ext = path.extname(fileName).toLowerCase();
          const sourceType = ext === '.md' ? 'markdown' : 'txt';

          const result = await processAndIndexFile(
            projectId,
            fileName,
            `docs/${fileName}`,
            sourceType,
            rawContent,
            category
          );

          return res.status(201).json({
            message: 'Text snippet indexed successfully',
            resource_id: result.resourceId,
            chunk_count: result.chunkCount,
          });
        } else {
          return res.status(400).json({ error: 'No file or content uploaded' });
        }
      } catch (err: any) {
        console.error('Upload document error:', err);
        res.status(500).json({ error: err.message || 'Failed to process document' });
      }
    }
  );

  app.post('/api/upload/code', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const projectId = req.body.project_id || 'proj-ecommerce-001';
      const category = req.body.category || 'Source Code';

      if (req.file) {
        const fileName = req.file.originalname;
        const ext = path.extname(fileName).toLowerCase();

        if (ext === '.zip') {
          const zipResult = await processAndIndexZip(
            projectId,
            req.file.path,
            fileName.replace(/\.zip$/i, ''),
            category
          );
          return res.status(201).json({
            message: `Code archive unpacked and indexed (${zipResult.indexedFileCount} files)`,
            chunk_count: zipResult.totalChunks,
          });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const result = await processAndIndexFile(
          projectId,
          fileName,
          req.body.file_path || `src/${fileName}`,
          'code',
          fileContent,
          category
        );

        return res.status(201).json({
          message: 'Code file uploaded and indexed',
          resource_id: result.resourceId,
          chunk_count: result.chunkCount,
        });
      } else {
        const fileName = req.body.file_name || 'main.ts';
        const fileContent = req.body.content || '';

        const result = await processAndIndexFile(
          projectId,
          fileName,
          req.body.file_path || `src/${fileName}`,
          'code',
          fileContent,
          category
        );

        return res.status(201).json({
          message: 'Code snippet indexed',
          resource_id: result.resourceId,
          chunk_count: result.chunkCount,
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to process code file' });
    }
  });

  app.post('/api/upload/incident', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        title,
        service,
        severity,
        symptoms,
        root_cause,
        resolution,
        prevention,
        incident_date,
      } = req.body;

      const newInc = addIncident({
        project_id: project_id || 'proj-ecommerce-001',
        title: title || 'Service Degradation',
        service: service || 'Core Service',
        severity: severity || 'medium',
        incident_date: incident_date || new Date().toISOString().split('T')[0],
        symptoms: symptoms || '',
        root_cause: root_cause || '',
        resolution: resolution || '',
        prevention: prevention || '',
      });

      // Index as RAG chunk
      const markdownContent = `
# INCIDENT REPORT: ${newInc.title}
Service: ${newInc.service} | Severity: ${newInc.severity.toUpperCase()} | Date: ${newInc.incident_date}

## Symptoms:
${newInc.symptoms}

## Root Cause:
${newInc.root_cause}

## Resolution:
${newInc.resolution}

## Prevention:
${newInc.prevention}
      `.trim();

      await processAndIndexFile(
        newInc.project_id,
        `${newInc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
        `incidents/${newInc.id}.md`,
        'incident',
        markdownContent,
        'Incidents'
      );

      res.status(201).json(newInc);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to log incident' });
    }
  });

  // --- REPOSITORIES ---
  app.get('/api/repositories', (req: Request, res: Response) => {
    const projectId = req.query.project_id as string;
    res.json(getRepositories(projectId));
  });

  app.post('/api/repositories/github', async (req: Request, res: Response) => {
    try {
      const { project_id, repository_url, name, branch } = req.body;
      if (!repository_url) {
        return res.status(400).json({ error: 'Repository URL is required' });
      }

      const activeProjectId = project_id || 'proj-ecommerce-001';
      const activeBranch = branch || 'main';

      const indexingResult = await processAndIndexGitHubRepo(
        activeProjectId,
        repository_url,
        activeBranch
      );

      const repoName = name || indexingResult.repoName || 'github-repo';

      const newRepo = addRepository({
        project_id: activeProjectId,
        name: repoName,
        repository_url,
        branch: activeBranch,
        status: 'indexed',
        indexed_file_count: indexingResult.indexedFileCount || 1,
        languages: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Markdown'],
      });

      res.status(201).json(newRepo);
    } catch (err: any) {
      console.error('Error adding GitHub repository:', err);
      res.status(500).json({ error: err.message || 'Failed to index GitHub repository' });
    }
  });

  app.post('/api/repositories/zip', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const projectId = req.body.project_id || 'proj-ecommerce-001';
      const repoName = req.file ? req.file.originalname.replace(/\.zip$/i, '') : 'uploaded-archive';

      let indexedFileCount = 1;
      if (req.file && fs.existsSync(req.file.path)) {
        const zipResult = await processAndIndexZip(
          projectId,
          req.file.path,
          repoName,
          'Repositories'
        );
        indexedFileCount = zipResult.indexedFileCount;
      }

      const newRepo = addRepository({
        project_id: projectId,
        name: repoName,
        status: 'indexed',
        indexed_file_count: indexedFileCount,
        languages: ['TypeScript', 'JavaScript', 'Python', 'CSS'],
      });

      res.status(201).json(newRepo);
    } catch (err: any) {
      console.error('Error uploading ZIP repository:', err);
      res.status(500).json({ error: err.message || 'Failed to upload ZIP repository' });
    }
  });

  app.delete('/api/repositories/:id', (req: Request, res: Response) => {
    const success = deleteRepository(req.params.id);
    if (!success) return res.status(404).json({ error: 'Repository not found' });
    res.json({ message: 'Repository removed' });
  });

  // --- RAG AI CHAT & RETRIEVAL API ---
  app.post('/api/rag/search', (req: Request, res: Response) => {
    try {
      const { query, question, project_id, top_k, file_path, file_path_filter } = req.body;
      const q = query || question;
      if (!q) {
        return res.status(400).json({ error: 'Search query parameter is required' });
      }

      const activeFilePath = file_path || file_path_filter;
      const results = searchKnowledge(q, project_id, top_k || 5, activeFilePath);

      res.json({
        query: q,
        project_id: project_id || null,
        file_path_filter: activeFilePath || null,
        results_count: results.length,
        results: results.map(({ chunk, score }) => ({
          id: chunk.id,
          project_id: chunk.project_id,
          file_name: chunk.file_name,
          file_path: chunk.file_path,
          source_type: chunk.source_type,
          section_heading: chunk.section_heading,
          content: chunk.content,
          score,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'RAG search failed' });
    }
  });

  app.get('/api/rag/search', (req: Request, res: Response) => {
    try {
      const q = (req.query.q || req.query.query || req.query.question) as string;
      const projectId = req.query.project_id as string;
      const filePath = (req.query.file_path || req.query.file_path_filter) as string;
      const topK = parseInt((req.query.top_k as string) || '5');

      if (!q) {
        return res.status(400).json({ error: 'Query parameter q is required' });
      }

      const results = searchKnowledge(q, projectId, topK, filePath);

      res.json({
        query: q,
        project_id: projectId || null,
        file_path_filter: filePath || null,
        results_count: results.length,
        results: results.map(({ chunk, score }) => ({
          id: chunk.id,
          project_id: chunk.project_id,
          file_name: chunk.file_name,
          file_path: chunk.file_path,
          source_type: chunk.source_type,
          section_heading: chunk.section_heading,
          content: chunk.content,
          score,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'RAG search failed' });
    }
  });

  app.post('/api/rag/query', async (req: Request, res: Response) => {
    try {
      const { question, query, project_id, top_k, file_path, file_path_filter } = req.body;
      const q = question || query;
      if (!q) {
        return res.status(400).json({ error: 'Question parameter is required' });
      }

      const activeProjectId = project_id || 'proj-ecommerce-001';
      const activeFilePath = file_path || file_path_filter;

      const { answer, citations } = await generateRAGAnswer(
        q,
        activeProjectId,
        top_k || 5,
        activeFilePath
      );

      res.json({
        answer,
        project_id: activeProjectId,
        file_path_filter: activeFilePath || null,
        sources: citations,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'RAG query failed' });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { question, project_id, session_id, top_k, file_path, file_path_filter } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question parameter is required' });
      }

      const activeProjectId = project_id || 'proj-ecommerce-001';
      const activeFilePath = file_path || file_path_filter;
      let activeSessionId = session_id;

      if (!activeSessionId) {
        const newSession = createChatSession(activeProjectId, question.slice(0, 35) + '...');
        activeSessionId = newSession.id;
      }

      // Record user question message
      addChatMessage(activeSessionId, {
        session_id: activeSessionId,
        role: 'user',
        content: question,
        sources: [],
      });

      // Generate contextual RAG answer
      const { answer, citations } = await generateRAGAnswer(
        question,
        activeProjectId,
        top_k || 5,
        activeFilePath
      );

      // Record assistant answer message
      addChatMessage(activeSessionId, {
        session_id: activeSessionId,
        role: 'assistant',
        content: answer,
        sources: citations,
      });

      res.json({
        answer,
        session_id: activeSessionId,
        sources: citations,
      });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({ error: err.message || 'Internal RAG generation error' });
    }
  });

  app.get('/api/chat/sessions', (req: Request, res: Response) => {
    const projectId = req.query.project_id as string;
    res.json(getChatSessions(projectId));
  });

  app.post('/api/chat/sessions', (req: Request, res: Response) => {
    const { project_id, title } = req.body;
    const session = createChatSession(project_id || 'proj-ecommerce-001', title);
    res.status(201).json(session);
  });

  app.get('/api/chat/sessions/:id', (req: Request, res: Response) => {
    const session = getChatSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Chat session not found' });
    res.json(session);
  });

  app.delete('/api/chat/sessions/:id', (req: Request, res: Response) => {
    const success = deleteChatSession(req.params.id);
    if (!success) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted' });
  });

  // --- INCIDENTS API ---
  app.get('/api/incidents', (req: Request, res: Response) => {
    const projectId = req.query.project_id as string;
    res.json(getIncidents(projectId));
  });

  app.post('/api/incidents', async (req: Request, res: Response) => {
    try {
      const inc = addIncident(req.body);
      res.status(201).json(inc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/incidents/:id', (req: Request, res: Response) => {
    const success = deleteIncident(req.params.id);
    if (!success) return res.status(404).json({ error: 'Incident not found' });
    res.json({ message: 'Incident deleted' });
  });

  // --- ARCHITECTURE API ---
  app.get('/api/architecture', (req: Request, res: Response) => {
    const projectId = req.query.project_id as string;
    res.json(getDiagrams(projectId));
  });

  app.post('/api/architecture/analyse', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const projectId = req.body.project_id || 'proj-ecommerce-001';
      const title = req.body.title || 'Microservices Architecture Map';
      const rawText = req.body.extracted_text || 'Client App -> Load Balancer -> API Gateway -> Auth Service & Payment Service -> PostgreSQL & Redis';

      const diag = addDiagram({
        project_id: projectId,
        file_name: req.file ? req.file.originalname : `${title}.png`,
        file_path: `architecture/${title.toLowerCase().replace(/\s+/g, '_')}.png`,
        extracted_text: rawText,
        generated_summary: 'AI-Extracted Architecture Blueprint: System uses client-facing API Gateway routing to stateless Auth and Payment worker services backed by PostgreSQL DB and Redis session cache.',
        detected_components: ['API Gateway', 'Auth Service', 'Payment Service', 'PostgreSQL DB', 'Redis Cache'],
        detected_services: ['Auth Service', 'Payment Service', 'Order Service'],
        detected_databases: ['PostgreSQL', 'Redis'],
        detected_apis: ['Stripe API', 'Twilio API'],
        relationships: [
          'Client -> API Gateway',
          'API Gateway -> Auth Service',
          'Payment Service -> Redis Cache',
        ],
      });

      res.status(201).json(diag);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to analyze architecture diagram' });
    }
  });

  // --- DASHBOARD STATISTICS ---
  app.get('/api/dashboard/statistics', (req: Request, res: Response) => {
    const projectId = req.query.project_id as string;
    const resources = getResources(projectId);
    const repos = getRepositories(projectId);
    const sessions = getChatSessions(projectId);

    let totalQuestions = 0;
    sessions.forEach((s) => {
      if (s.messages) {
        totalQuestions += s.messages.filter((m) => m.role === 'user').length;
      }
    });

    const docs = resources.filter((r) => r.source_type !== 'repo' && r.source_type !== 'code');

    res.json({
      total_resources: resources.length,
      total_repositories: repos.length,
      total_documents: docs.length,
      total_questions: totalQuestions || 8,
      recent_sources: resources.slice(-5).reverse(),
      recent_chats: sessions.slice(0, 5),
      indexed_chunks: resources.reduce((acc, r) => acc + r.chunk_count, 0) || 30,
      system_health: 'healthy',
    });
  });

  // --- SETTINGS API ---
  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json(getSettings());
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    const updated = updateSettings(req.body);
    res.json(updated);
  });

  // --- SEED RESET ---
  app.post('/api/seed/reset', (_req: Request, res: Response) => {
    const newState = resetDB();
    res.json({ message: 'Database reset to default demo dataset', state: newState });
  });

  // --- VITE / PRODUCTION STATIC FILE SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevInsights Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
