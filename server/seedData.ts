import { Project, Resource, Repository, Incident, ArchitectureDiagram, ChatSession, ChatMessage } from '../src/types.js';

export const DEFAULT_PROJECT: Project = {
  id: 'proj-ecommerce-001',
  name: 'E-Commerce Platform',
  description: 'Core microservices backend, React frontend, payment processing, and authentication service.',
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'res-auth-01',
    project_id: 'proj-ecommerce-001',
    name: 'login.ts',
    source_type: 'code',
    file_path: 'src/services/auth/login.ts',
    status: 'indexed',
    chunk_count: 4,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Authentication',
    size_bytes: 2450,
  },
  {
    id: 'res-auth-02',
    project_id: 'proj-ecommerce-001',
    name: 'authMiddleware.ts',
    source_type: 'code',
    file_path: 'src/middleware/authMiddleware.ts',
    status: 'indexed',
    chunk_count: 3,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Middleware',
    size_bytes: 1820,
  },
  {
    id: 'res-pay-01',
    project_id: 'proj-ecommerce-001',
    name: 'paymentService.py',
    source_type: 'code',
    file_path: 'services/payment/paymentService.py',
    status: 'indexed',
    chunk_count: 5,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Payments',
    size_bytes: 3890,
  },
  {
    id: 'res-db-01',
    project_id: 'proj-ecommerce-001',
    name: 'database.ts',
    source_type: 'code',
    file_path: 'src/config/database.ts',
    status: 'indexed',
    chunk_count: 2,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Database',
    size_bytes: 1120,
  },
  {
    id: 'res-doc-01',
    project_id: 'proj-ecommerce-001',
    name: 'JWT_Authentication_Guide.md',
    source_type: 'markdown',
    file_path: 'docs/JWT_Authentication_Guide.md',
    status: 'indexed',
    chunk_count: 6,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Documentation',
    size_bytes: 4100,
  },
  {
    id: 'res-inc-01',
    project_id: 'proj-ecommerce-001',
    name: 'INC-2026-042_Payment_Timeout.md',
    source_type: 'incident',
    file_path: 'incidents/INC-2026-042_Payment_Timeout.md',
    status: 'indexed',
    chunk_count: 4,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Incidents',
    size_bytes: 2900,
  },
  {
    id: 'res-arch-01',
    project_id: 'proj-ecommerce-001',
    name: 'Microservices_Architecture_v2.png',
    source_type: 'diagram',
    file_path: 'architecture/Microservices_Architecture_v2.png',
    status: 'indexed',
    chunk_count: 3,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: 'Architecture',
    size_bytes: 84000,
  },
];

export const SAMPLE_REPOSITORIES: Repository[] = [
  {
    id: 'repo-01',
    project_id: 'proj-ecommerce-001',
    name: 'ecommerce-api-backend',
    repository_url: 'https://github.com/org/ecommerce-api-backend.git',
    branch: 'main',
    status: 'indexed',
    indexed_file_count: 42,
    languages: ['TypeScript', 'Python', 'SQL'],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'repo-02',
    project_id: 'proj-ecommerce-001',
    name: 'ecommerce-web-frontend',
    repository_url: 'https://github.com/org/ecommerce-web-frontend.git',
    branch: 'main',
    status: 'indexed',
    indexed_file_count: 38,
    languages: ['TypeScript', 'React', 'TailwindCSS'],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SAMPLE_INCIDENTS: Incident[] = [
  {
    id: 'inc-01',
    project_id: 'proj-ecommerce-001',
    title: 'Payment Gateway Timeout & Redis Cache Connection Exhaustion',
    service: 'Payment Service',
    severity: 'high',
    incident_date: '2026-07-15',
    symptoms: '504 Gateway Timeout errors during checkout peak hour. Checkout latency spiked to > 12,000ms.',
    root_cause: 'The payment service failed to close unpooled Redis connections during token validation calls, exhausting the Redis connection pool and causing thread blocking.',
    resolution: 'Implemented connection pooling using redis-py connection pool with max_connections=50 and added an automatic circuit breaker for Stripe API calls.',
    prevention: 'Configured connection pool health checks, added Prometheus metrics for connection counts, and updated integration test suites.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inc-02',
    project_id: 'proj-ecommerce-001',
    title: 'PostgreSQL Database Connection Spike on Auth Service',
    service: 'Auth Service',
    severity: 'medium',
    incident_date: '2026-06-28',
    symptoms: 'Auth service latency degraded by 450ms. Error logs reported "too many clients for database postgres".',
    root_cause: 'Missing index on user_sessions.token column caused full sequential table scans during JWT token revocation verification.',
    resolution: 'Added B-tree index on user_sessions(token) and user_sessions(user_id, expires_at).',
    prevention: 'Added automated query execution plan linting in CI/CD pipeline.',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export const SAMPLE_DIAGRAMS: ArchitectureDiagram[] = [
  {
    id: 'arch-01',
    project_id: 'proj-ecommerce-001',
    file_name: 'Microservices_Architecture_v2.png',
    file_path: 'architecture/Microservices_Architecture_v2.png',
    extracted_text: 'Client React App -> NGINX Ingress -> API Gateway -> Auth Service & Payment Service -> PostgreSQL & Redis Cache Cluster -> Stripe / Twilio External APIs',
    generated_summary: 'Overall system layout shows a modern microservices architecture where client requests route through NGINX Ingress to the API Gateway. Authentication is handled statelessly via JWT with PostgreSQL user database and Redis session token blacklist.',
    detected_components: ['NGINX Ingress', 'API Gateway', 'Auth Service', 'Payment Service', 'Order Service', 'Notification Worker'],
    detected_services: ['Auth Service (TypeScript/Express)', 'Payment Service (Python/FastAPI)', 'Order Service (Node.js)'],
    detected_databases: ['PostgreSQL (Primary DB)', 'Redis Cluster (Caching & Rate Limiting)'],
    detected_apis: ['Stripe Payments API', 'Twilio SMS API', 'SendGrid Email API'],
    relationships: [
      'Auth Service connects to PostgreSQL for user credential verification.',
      'Payment Service queries Redis for idempotent transaction keys before invoking Stripe.',
      'API Gateway proxies /api/v1/auth requests directly to Auth Service.'
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const RAW_SAMPLE_CHUNKS = [
  {
    id: 'chunk-auth-01',
    resource_id: 'res-auth-01',
    project_id: 'proj-ecommerce-001',
    source_type: 'code' as const,
    file_name: 'login.ts',
    file_path: 'src/services/auth/login.ts',
    section_heading: 'Login Function & Password Verification',
    line_number: 14,
    content: `
/**
 * src/services/auth/login.ts
 * Core User Authentication and JWT Token Issuance Service
 */
import { bcrypt } from 'bcrypt';
import { jwt } from 'jsonwebtoken';
import { db } from '../../config/database';

export async function loginUser(email: string, pass: string) {
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!user.rows[0]) throw new Error('User not found');
  
  const valid = await bcrypt.compare(pass, user.rows[0].password_hash);
  if (!valid) throw new Error('Invalid credentials');
  
  const accessToken = jwt.sign(
    { userId: user.rows[0].id, role: user.rows[0].role },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: '15m' }
  );
  return { user: user.rows[0], accessToken };
}
    `.trim(),
  },
  {
    id: 'chunk-auth-02',
    resource_id: 'res-auth-02',
    project_id: 'proj-ecommerce-001',
    source_type: 'code' as const,
    file_name: 'authMiddleware.ts',
    file_path: 'src/middleware/authMiddleware.ts',
    section_heading: 'Express Authentication Guard Middleware',
    line_number: 8,
    content: `
/**
 * src/middleware/authMiddleware.ts
 * Express JWT Authentication Middleware
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}
    `.trim(),
  },
  {
    id: 'chunk-pay-01',
    resource_id: 'res-pay-01',
    project_id: 'proj-ecommerce-001',
    source_type: 'code' as const,
    file_name: 'paymentService.py',
    file_path: 'services/payment/paymentService.py',
    section_heading: 'Payment Processing Engine & Stripe Integration',
    line_number: 22,
    content: `
"""
services/payment/paymentService.py
FastAPI Payment Processing Service with Stripe API & Redis Idempotency
"""
import stripe
import redis
import os

redis_pool = redis.ConnectionPool(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=6379,
    max_connections=50,
    decode_responses=True
)

def process_payment(order_id: str, amount: int, currency: str = "usd"):
    r = redis.Redis(connection_pool=redis_pool)
    idempotency_key = f"pay_idempotency_{order_id}"
    
    if r.get(idempotency_key):
        return {"status": "success", "message": "Duplicate request handled safely"}
        
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    charge = stripe.Charge.create(
        amount=amount,
        currency=currency,
        description=f"Order {order_id}",
        idempotency_key=idempotency_key
    )
    r.setex(idempotency_key, 86400, charge.id)
    return {"status": "success", "charge_id": charge.id}
    `.trim(),
  },
  {
    id: 'chunk-db-01',
    resource_id: 'res-db-01',
    project_id: 'proj-ecommerce-001',
    source_type: 'code' as const,
    file_name: 'database.ts',
    file_path: 'src/config/database.ts',
    section_heading: 'PostgreSQL Database Connection Pool Config',
    line_number: 5,
    content: `
/**
 * src/config/database.ts
 * PostgreSQL Connection Pool Instance
 */
import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'ecommerce_db',
  max: 20,
  idleTimeoutMillis: 30000,
});
    `.trim(),
  },
  {
    id: 'chunk-doc-01',
    resource_id: 'res-doc-01',
    project_id: 'proj-ecommerce-001',
    source_type: 'markdown' as const,
    file_name: 'JWT_Authentication_Guide.md',
    file_path: 'docs/JWT_Authentication_Guide.md',
    section_heading: 'Authentication Architecture Overview',
    line_number: 1,
    content: `
# E-Commerce Platform Authentication Guide

## Overview
Authentication is implemented in the Auth Service using JSON Web Tokens (JWT).
All incoming REST requests pass through the Express \`authMiddleware.ts\` layer.

### Key Entry Points:
1. \`src/services/auth/login.ts\`: Validates user password against bcrypt hash in PostgreSQL, generates a 15-minute access token.
2. \`src/middleware/authMiddleware.ts\`: Intercepts Authorization Bearer tokens and attaches decoded payload to \`req.user\`.
3. \`src/config/database.ts\`: Manages database connections for user account retrieval.

New backend developers should start by studying \`login.ts\`, \`authMiddleware.ts\`, and \`database.ts\`.
    `.trim(),
  },
  {
    id: 'chunk-inc-01',
    resource_id: 'res-inc-01',
    project_id: 'proj-ecommerce-001',
    source_type: 'incident' as const,
    file_name: 'INC-2026-042_Payment_Timeout.md',
    file_path: 'incidents/INC-2026-042_Payment_Timeout.md',
    section_heading: 'Root Cause & Resolution of Payment Outage',
    line_number: 1,
    content: `
# INC-2026-042: Payment Gateway Timeout & Redis Cache Failure

## Service Affected: Payment Service
## Severity: High
## Date: 2026-07-15

### What caused the previous payment-service incident?
The payment service was creating standalone unpooled Redis connection instances for every transaction in \`services/payment/paymentService.py\`. During peak checkout load, open TCP connections exhausted OS limits, causing Stripe API requests to hang and timeout with HTTP 504.

### Resolution:
Configured a global Redis Connection Pool (\`redis_pool = redis.ConnectionPool(max_connections=50)\`) and enabled circuit breaking on Stripe charges.
    `.trim(),
  },
  {
    id: 'chunk-arch-01',
    resource_id: 'res-arch-01',
    project_id: 'proj-ecommerce-001',
    source_type: 'diagram' as const,
    file_name: 'Microservices_Architecture_v2.png',
    file_path: 'architecture/Microservices_Architecture_v2.png',
    section_heading: 'Database and Cache Connections',
    line_number: 1,
    content: `
Architecture Diagram Extraction:
- Auth Service connects to PostgreSQL DB for credential validation.
- Payment Service connects to PostgreSQL for transaction history and Redis for idempotency key storage.
- External APIs integrated: Stripe for payment processing, Twilio for SMS verification.
    `.trim(),
  }
];

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-demo-01',
    project_id: 'proj-ecommerce-001',
    title: 'Authentication & Login Location',
    created_at: new Date(Date.now() - 1000000).toISOString(),
    updated_at: new Date(Date.now() - 1000000).toISOString(),
    messages: [
      {
        id: 'msg-01',
        session_id: 'session-demo-01',
        role: 'user',
        content: 'Where is authentication implemented?',
        sources: [],
        created_at: new Date(Date.now() - 1000000).toISOString(),
      },
      {
        id: 'msg-02',
        session_id: 'session-demo-01',
        role: 'assistant',
        content: `Authentication is primarily implemented in two key files in the **E-Commerce Platform** codebase:

1. **User Login & Token Generation**: Located at \`src/services/auth/login.ts\`. The \`loginUser\` function verifies credentials against password hashes stored in PostgreSQL and issues a signed JSON Web Token (JWT) expiring in 15 minutes.
2. **Request Verification Middleware**: Located at \`src/middleware/authMiddleware.ts\`. The \`authenticateToken\` function intercepts incoming HTTP requests, extracts the \`Authorization: Bearer <token>\` header, and verifies its signature before attaching \`req.user\`.

### Key Code Files to Review:
- \`src/services/auth/login.ts\` (Login validation & JWT signing)
- \`src/middleware/authMiddleware.ts\` (Route protection)
- \`docs/JWT_Authentication_Guide.md\` (Architectural documentation)`,
        sources: [
          {
            resource_id: 'res-auth-01',
            file_name: 'login.ts',
            file_path: 'src/services/auth/login.ts',
            source_type: 'code',
            content_preview: 'export async function loginUser(email: string, pass: string) { const user = await db.query...',
            relevance_score: 0.96,
            line_number: 14,
            section_heading: 'Login Function & Password Verification',
          },
          {
            resource_id: 'res-auth-02',
            file_name: 'authMiddleware.ts',
            file_path: 'src/middleware/authMiddleware.ts',
            source_type: 'code',
            content_preview: 'export function authenticateToken(req: Request, res: Response, next: NextFunction) { ...',
            relevance_score: 0.92,
            line_number: 8,
            section_heading: 'Express Authentication Guard Middleware',
          },
        ],
        created_at: new Date(Date.now() - 990000).toISOString(),
      },
    ],
  },
];
