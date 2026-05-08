import { z } from 'zod';

const toolInputSchema = z.object({
  name: z.enum([
    'cursor',
    'github-copilot',
    'claude',
    'chatgpt',
    'gemini',
    'anthropic',
    'openai',
    'windsurf',
  ]),
  plan: z.string().min(1),
  monthlySpend: z.number().min(0).max(100000),
  seats: z.number().min(1).max(1000),
});

export const auditRequestSchema = z.object({
  email: z.string().email().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().min(1).max(1000),
  useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
  tools: z.array(toolInputSchema).min(1).max(20),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;