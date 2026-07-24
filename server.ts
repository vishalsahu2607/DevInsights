import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";

import {
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
} from "./server/db.js";

import {
  generateRAGAnswer,
  searchKnowledge,
  processAndIndexFile,
  processAndIndexZip,
  processAndIndexGitHubRepo,
} from "./server/rag.js";

import type { SourceType } from "./src/types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function bufferToText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

function createApp(): ReturnType<typeof express> {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.use((req, _res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[API] ${req.method} ${req.path}`);
    }

    next();
  });

  // ---------------------------------------------------------------------------
  // Health
  // ---------------------------------------------------------------------------

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "DevInsights AI Engine",
      timestamp: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------------

  app.get("/api/projects", async (_req: Request, res: Response) => {
    try {
      const projects = await getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load projects"),
      });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body as {
        name?: string;
        description?: string;
      };

      if (!name?.trim()) {
        res.status(400).json({
          error: "Project name is required",
        });
        return;
      }

      const project = await addProject(name, description || "");
      res.status(201).json(project);
    } catch (error) {
      console.error("Failed to create project:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to create project"),
      });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const project = await getProjectById(req.params.id);

      if (!project) {
        res.status(404).json({
          error: "Project not found",
        });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error("Failed to load project:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load project"),
      });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body as {
        name?: string;
        description?: string;
      };

      if (!name?.trim()) {
        res.status(400).json({
          error: "Project name is required",
        });
        return;
      }

      const project = await updateProject(
        req.params.id,
        name,
        description || "",
      );

      if (!project) {
        res.status(404).json({
          error: "Project not found",
        });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error("Failed to update project:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to update project"),
      });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await deleteProject(req.params.id);

      if (!deleted) {
        res.status(404).json({
          error: "Project not found",
        });
        return;
      }

      res.json({
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to delete project"),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Resources
  // ---------------------------------------------------------------------------

  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project_id as string | undefined;
      const resources = await getResources(projectId);
      res.json(resources);
    } catch (error) {
      console.error("Failed to load resources:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load resources"),
      });
    }
  });

  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const resource = await getResourceById(req.params.id);

      if (!resource) {
        res.status(404).json({
          error: "Resource not found",
        });
        return;
      }

      res.json(resource);
    } catch (error) {
      console.error("Failed to load resource:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load resource"),
      });
    }
  });

  app.delete("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await deleteResource(req.params.id);

      if (!deleted) {
        res.status(404).json({
          error: "Resource not found",
        });
        return;
      }

      res.json({
        message: "Resource deleted",
      });
    } catch (error) {
      console.error("Failed to delete resource:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to delete resource"),
      });
    }
  });

  app.post(
    "/api/resources/:id/reindex",
    async (req: Request, res: Response) => {
      try {
        const resource = await getResourceById(req.params.id);

        if (!resource) {
          res.status(404).json({
            error: "Resource not found",
          });
          return;
        }

        res.json({
          message:
            "Resource is already indexed. Upload the source again to regenerate its chunks.",
          resource,
        });
      } catch (error) {
        console.error("Failed to reindex resource:", error);
        res.status(500).json({
          error: getErrorMessage(error, "Failed to reindex resource"),
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // Uploads
  // ---------------------------------------------------------------------------

  app.post(
    "/api/upload/document",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const projectId =
          (req.body.project_id as string | undefined) ||
          "proj-ecommerce-001";
        const category =
          (req.body.category as string | undefined) || "Documentation";
        const rawContent = req.body.content as string | undefined;

        if (req.file) {
          const fileName = req.file.originalname;
          const extension = path.extname(fileName).toLowerCase();

          if (extension === ".zip") {
            const result = await processAndIndexZip(
              projectId,
              req.file.buffer,
              fileName.replace(/\.zip$/i, ""),
              category,
            );

            res.status(201).json({
              message: `ZIP archive unpacked and indexed successfully (${result.indexedFileCount} files, ${result.totalChunks} chunks)`,
              chunk_count: result.totalChunks,
            });
            return;
          }

          const sourceType: SourceType =
            extension === ".pdf"
              ? "pdf"
              : extension === ".docx"
                ? "docx"
                : extension === ".md"
                  ? "markdown"
                  : [
                        ".ts",
                        ".tsx",
                        ".js",
                        ".jsx",
                        ".py",
                        ".go",
                        ".java",
                      ].includes(extension)
                    ? "code"
                    : "txt";

          const fileContent = bufferToText(req.file.buffer);

          const result = await processAndIndexFile(
            projectId,
            fileName,
            `docs/${fileName}`,
            sourceType,
            fileContent,
            category,
          );

          res.status(201).json({
            message: "Document uploaded and indexed successfully",
            resource_id: result.resourceId,
            chunk_count: result.chunkCount,
          });
          return;
        }

        if (rawContent?.trim()) {
          const fileName =
            (req.body.file_name as string | undefined) ||
            "Document_Paste.txt";
          const extension = path.extname(fileName).toLowerCase();
          const sourceType: SourceType =
            extension === ".md" ? "markdown" : "txt";

          const result = await processAndIndexFile(
            projectId,
            fileName,
            `docs/${fileName}`,
            sourceType,
            rawContent,
            category,
          );

          res.status(201).json({
            message: "Text snippet indexed successfully",
            resource_id: result.resourceId,
            chunk_count: result.chunkCount,
          });
          return;
        }

        res.status(400).json({
          error: "No file or content uploaded",
        });
      } catch (error) {
        console.error("Upload document error:", error);
        res.status(500).json({
          error: getErrorMessage(error, "Failed to process document"),
        });
      }
    },
  );

  app.post(
    "/api/upload/code",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const projectId =
          (req.body.project_id as string | undefined) ||
          "proj-ecommerce-001";
        const category =
          (req.body.category as string | undefined) || "Source Code";

        if (req.file) {
          const fileName = req.file.originalname;
          const extension = path.extname(fileName).toLowerCase();

          if (extension === ".zip") {
            const result = await processAndIndexZip(
              projectId,
              req.file.buffer,
              fileName.replace(/\.zip$/i, ""),
              category,
            );

            res.status(201).json({
              message: `Code archive unpacked and indexed (${result.indexedFileCount} files)`,
              chunk_count: result.totalChunks,
            });
            return;
          }

          const fileContent = bufferToText(req.file.buffer);
          const result = await processAndIndexFile(
            projectId,
            fileName,
            (req.body.file_path as string | undefined) ||
              `src/${fileName}`,
            "code",
            fileContent,
            category,
          );

          res.status(201).json({
            message: "Code file uploaded and indexed",
            resource_id: result.resourceId,
            chunk_count: result.chunkCount,
          });
          return;
        }

        const fileName =
          (req.body.file_name as string | undefined) || "main.ts";
        const fileContent =
          (req.body.content as string | undefined) || "";

        if (!fileContent.trim()) {
          res.status(400).json({
            error: "No code file or code content supplied",
          });
          return;
        }

        const result = await processAndIndexFile(
          projectId,
          fileName,
          (req.body.file_path as string | undefined) ||
            `src/${fileName}`,
          "code",
          fileContent,
          category,
        );

        res.status(201).json({
          message: "Code snippet indexed",
          resource_id: result.resourceId,
          chunk_count: result.chunkCount,
        });
      } catch (error) {
        console.error("Upload code error:", error);
        res.status(500).json({
          error: getErrorMessage(error, "Failed to process code file"),
        });
      }
    },
  );

  app.post("/api/upload/incident", async (req: Request, res: Response) => {
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

      const incident = await addIncident({
        project_id: project_id || "proj-ecommerce-001",
        title: title || "Service Degradation",
        service: service || "Core Service",
        severity: severity || "medium",
        incident_date:
          incident_date || new Date().toISOString().split("T")[0],
        symptoms: symptoms || "",
        root_cause: root_cause || "",
        resolution: resolution || "",
        prevention: prevention || "",
      });

      const markdownContent = `
# INCIDENT REPORT: ${incident.title}
Service: ${incident.service} | Severity: ${incident.severity.toUpperCase()} | Date: ${incident.incident_date}

## Symptoms:
${incident.symptoms}

## Root Cause:
${incident.root_cause}

## Resolution:
${incident.resolution}

## Prevention:
${incident.prevention}
      `.trim();

      await processAndIndexFile(
        incident.project_id,
        `${incident.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`,
        `incidents/${incident.id}.md`,
        "incident",
        markdownContent,
        "Incidents",
      );

      res.status(201).json(incident);
    } catch (error) {
      console.error("Failed to log incident:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to log incident"),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Repositories
  // ---------------------------------------------------------------------------

  app.get("/api/repositories", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project_id as string | undefined;
      const repositories = await getRepositories(projectId);
      res.json(repositories);
    } catch (error) {
      console.error("Failed to load repositories:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load repositories"),
      });
    }
  });

  app.post(
    "/api/repositories/github",
    async (req: Request, res: Response) => {
      try {
        const {
          project_id,
          repository_url,
          name,
          branch,
        } = req.body as {
          project_id?: string;
          repository_url?: string;
          name?: string;
          branch?: string;
        };

        if (!repository_url?.trim()) {
          res.status(400).json({
            error: "Repository URL is required",
          });
          return;
        }

        const activeProjectId =
          project_id || "proj-ecommerce-001";
        const activeBranch = branch || "main";

        const indexingResult = await processAndIndexGitHubRepo(
          activeProjectId,
          repository_url,
          activeBranch,
        );

        const repository = await addRepository({
          project_id: activeProjectId,
          name: name || indexingResult.repoName || "github-repo",
          repository_url,
          branch: activeBranch,
          status: "indexed",
          indexed_file_count: indexingResult.indexedFileCount || 1,
          languages: [
            "TypeScript",
            "JavaScript",
            "Python",
            "Go",
            "Markdown",
          ],
        });

        res.status(201).json(repository);
      } catch (error) {
        console.error("Error adding GitHub repository:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to index GitHub repository",
          ),
        });
      }
    },
  );

  app.post(
    "/api/repositories/zip",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const projectId =
          (req.body.project_id as string | undefined) ||
          "proj-ecommerce-001";

        if (!req.file) {
          res.status(400).json({
            error: "ZIP repository file is required",
          });
          return;
        }

        const repositoryName = req.file.originalname.replace(
          /\.zip$/i,
          "",
        );

        const indexingResult = await processAndIndexZip(
          projectId,
          req.file.buffer,
          repositoryName,
          "Repositories",
        );

        const repository = await addRepository({
          project_id: projectId,
          name: repositoryName,
          status: "indexed",
          indexed_file_count: indexingResult.indexedFileCount,
          languages: [
            "TypeScript",
            "JavaScript",
            "Python",
            "CSS",
          ],
        });

        res.status(201).json(repository);
      } catch (error) {
        console.error("Error uploading ZIP repository:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to upload ZIP repository",
          ),
        });
      }
    },
  );

  app.delete(
    "/api/repositories/:id",
    async (req: Request, res: Response) => {
      try {
        const deleted = await deleteRepository(req.params.id);

        if (!deleted) {
          res.status(404).json({
            error: "Repository not found",
          });
          return;
        }

        res.json({
          message: "Repository removed",
        });
      } catch (error) {
        console.error("Failed to delete repository:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to delete repository",
          ),
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // RAG search and chat
  // ---------------------------------------------------------------------------

  app.post("/api/rag/search", async (req: Request, res: Response) => {
    try {
      const {
        query,
        question,
        project_id,
        top_k,
        file_path,
        file_path_filter,
      } = req.body;

      const searchQuery = query || question;

      if (!searchQuery) {
        res.status(400).json({
          error: "Search query parameter is required",
        });
        return;
      }

      const activeFilePath = file_path || file_path_filter;
      const results = await searchKnowledge(
        searchQuery,
        project_id,
        top_k || 5,
        activeFilePath,
      );

      res.json({
        query: searchQuery,
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
    } catch (error) {
      console.error("RAG search failed:", error);
      res.status(500).json({
        error: getErrorMessage(error, "RAG search failed"),
      });
    }
  });

  app.get("/api/rag/search", async (req: Request, res: Response) => {
    try {
      const searchQuery = (
        req.query.q ||
        req.query.query ||
        req.query.question
      ) as string | undefined;

      if (!searchQuery) {
        res.status(400).json({
          error: "Query parameter q is required",
        });
        return;
      }

      const projectId = req.query.project_id as string | undefined;
      const filePath = (
        req.query.file_path || req.query.file_path_filter
      ) as string | undefined;
      const topK = Number.parseInt(
        (req.query.top_k as string | undefined) || "5",
        10,
      );

      const results = await searchKnowledge(
        searchQuery,
        projectId,
        topK,
        filePath,
      );

      res.json({
        query: searchQuery,
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
    } catch (error) {
      console.error("RAG search failed:", error);
      res.status(500).json({
        error: getErrorMessage(error, "RAG search failed"),
      });
    }
  });

  app.post("/api/rag/query", async (req: Request, res: Response) => {
    try {
      const {
        question,
        query,
        project_id,
        top_k,
        file_path,
        file_path_filter,
      } = req.body;

      const searchQuery = question || query;

      if (!searchQuery) {
        res.status(400).json({
          error: "Question parameter is required",
        });
        return;
      }

      const activeProjectId =
        project_id || "proj-ecommerce-001";
      const activeFilePath = file_path || file_path_filter;

      const { answer, citations } = await generateRAGAnswer(
        searchQuery,
        activeProjectId,
        top_k || 5,
        activeFilePath,
      );

      res.json({
        answer,
        project_id: activeProjectId,
        file_path_filter: activeFilePath || null,
        sources: citations,
      });
    } catch (error) {
      console.error("RAG query failed:", error);
      res.status(500).json({
        error: getErrorMessage(error, "RAG query failed"),
      });
    }
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const {
        question,
        project_id,
        session_id,
        top_k,
        file_path,
        file_path_filter,
      } = req.body;

      if (!question) {
        res.status(400).json({
          error: "Question parameter is required",
        });
        return;
      }

      const activeProjectId =
        project_id || "proj-ecommerce-001";
      const activeFilePath = file_path || file_path_filter;
      let activeSessionId = session_id as string | undefined;

      if (!activeSessionId) {
        const session = await createChatSession(
          activeProjectId,
          `${question.slice(0, 35)}...`,
        );
        activeSessionId = session.id;
      }

      await addChatMessage(activeSessionId, {
        session_id: activeSessionId,
        role: "user",
        content: question,
        sources: [],
      });

      const { answer, citations } = await generateRAGAnswer(
        question,
        activeProjectId,
        top_k || 5,
        activeFilePath,
      );

      await addChatMessage(activeSessionId, {
        session_id: activeSessionId,
        role: "assistant",
        content: answer,
        sources: citations,
      });

      res.json({
        answer,
        session_id: activeSessionId,
        sources: citations,
      });
    } catch (error) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({
        error: getErrorMessage(
          error,
          "Internal RAG generation error",
        ),
      });
    }
  });

  app.get(
    "/api/chat/sessions",
    async (req: Request, res: Response) => {
      try {
        const projectId = req.query.project_id as
          | string
          | undefined;
        const sessions = await getChatSessions(projectId);
        res.json(sessions);
      } catch (error) {
        console.error("Failed to load chat sessions:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to load chat sessions",
          ),
        });
      }
    },
  );

  app.post(
    "/api/chat/sessions",
    async (req: Request, res: Response) => {
      try {
        const { project_id, title } = req.body;
        const session = await createChatSession(
          project_id || "proj-ecommerce-001",
          title,
        );
        res.status(201).json(session);
      } catch (error) {
        console.error("Failed to create chat session:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to create chat session",
          ),
        });
      }
    },
  );

  app.get(
    "/api/chat/sessions/:id",
    async (req: Request, res: Response) => {
      try {
        const session = await getChatSessionById(req.params.id);

        if (!session) {
          res.status(404).json({
            error: "Chat session not found",
          });
          return;
        }

        res.json(session);
      } catch (error) {
        console.error("Failed to load chat session:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to load chat session",
          ),
        });
      }
    },
  );

  app.delete(
    "/api/chat/sessions/:id",
    async (req: Request, res: Response) => {
      try {
        const deleted = await deleteChatSession(req.params.id);

        if (!deleted) {
          res.status(404).json({
            error: "Session not found",
          });
          return;
        }

        res.json({
          message: "Session deleted",
        });
      } catch (error) {
        console.error("Failed to delete chat session:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to delete chat session",
          ),
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // Incidents
  // ---------------------------------------------------------------------------

  app.get("/api/incidents", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project_id as string | undefined;
      const incidents = await getIncidents(projectId);
      res.json(incidents);
    } catch (error) {
      console.error("Failed to load incidents:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load incidents"),
      });
    }
  });

  app.post("/api/incidents", async (req: Request, res: Response) => {
    try {
      const incident = await addIncident(req.body);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Failed to create incident:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to create incident"),
      });
    }
  });

  app.delete(
    "/api/incidents/:id",
    async (req: Request, res: Response) => {
      try {
        const deleted = await deleteIncident(req.params.id);

        if (!deleted) {
          res.status(404).json({
            error: "Incident not found",
          });
          return;
        }

        res.json({
          message: "Incident deleted",
        });
      } catch (error) {
        console.error("Failed to delete incident:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to delete incident",
          ),
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // Architecture
  // ---------------------------------------------------------------------------

  app.get("/api/architecture", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project_id as string | undefined;
      const diagrams = await getDiagrams(projectId);
      res.json(diagrams);
    } catch (error) {
      console.error("Failed to load diagrams:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load diagrams"),
      });
    }
  });

  app.post(
    "/api/architecture/analyse",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const projectId =
          (req.body.project_id as string | undefined) ||
          "proj-ecommerce-001";
        const title =
          (req.body.title as string | undefined) ||
          "Microservices Architecture Map";
        const rawText =
          (req.body.extracted_text as string | undefined) ||
          "Client App -> Load Balancer -> API Gateway -> Auth Service & Payment Service -> PostgreSQL & Redis";

        const diagram = await addDiagram({
          project_id: projectId,
          file_name: req.file
            ? req.file.originalname
            : `${title}.png`,
          file_path: `architecture/${title
            .toLowerCase()
            .replace(/\s+/g, "_")}.png`,
          extracted_text: rawText,
          generated_summary:
            "AI-Extracted Architecture Blueprint: System uses client-facing API Gateway routing to stateless Auth and Payment worker services backed by PostgreSQL DB and Redis session cache.",
          detected_components: [
            "API Gateway",
            "Auth Service",
            "Payment Service",
            "PostgreSQL DB",
            "Redis Cache",
          ],
          detected_services: [
            "Auth Service",
            "Payment Service",
            "Order Service",
          ],
          detected_databases: ["PostgreSQL", "Redis"],
          detected_apis: ["Stripe API", "Twilio API"],
          relationships: [
            "Client -> API Gateway",
            "API Gateway -> Auth Service",
            "Payment Service -> Redis Cache",
          ],
        });

        res.status(201).json(diagram);
      } catch (error) {
        console.error("Failed to analyse architecture:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to analyze architecture diagram",
          ),
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  app.get(
    "/api/dashboard/statistics",
    async (req: Request, res: Response) => {
      try {
        const projectId = req.query.project_id as
          | string
          | undefined;

        const [resources, repositories, sessions] =
          await Promise.all([
            getResources(projectId),
            getRepositories(projectId),
            getChatSessions(projectId),
          ]);

        const totalQuestions = sessions.reduce((total, session) => {
          const messages = session.messages || [];
          return (
            total +
            messages.filter((message) => message.role === "user")
              .length
          );
        }, 0);

        const documents = resources.filter(
          (resource) =>
            resource.source_type !== "repo" &&
            resource.source_type !== "code",
        );

        res.json({
          total_resources: resources.length,
          total_repositories: repositories.length,
          total_documents: documents.length,
          total_questions: totalQuestions,
          recent_sources: resources.slice(-5).reverse(),
          recent_chats: sessions.slice(0, 5),
          indexed_chunks: resources.reduce(
            (total, resource) => total + resource.chunk_count,
            0,
          ),
          system_health: "healthy",
        });
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
        res.status(500).json({
          error: getErrorMessage(
            error,
            "Failed to load dashboard statistics",
          ),
        });
      }
    },
  );

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  app.get("/api/settings", async (_req: Request, res: Response) => {
    try {
      const settings = await getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to load settings"),
      });
    }
  });

  app.put("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to update settings"),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Seed reset
  // ---------------------------------------------------------------------------

  app.post("/api/seed/reset", async (_req: Request, res: Response) => {
    try {
      const state = await resetDB();
      res.json({
        message: "Database reset to default demo dataset",
        state,
      });
    } catch (error) {
      console.error("Failed to reset database:", error);
      res.status(500).json({
        error: getErrorMessage(error, "Failed to reset database"),
      });
    }
  });

  return app;
}

const app = createApp();

export default app;

// Start a normal HTTP server only during local development.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);

  app.listen(port, "0.0.0.0", () => {
    console.log(
      `[DevInsights Server] Running at http://0.0.0.0:${port}`,
    );
  });
}