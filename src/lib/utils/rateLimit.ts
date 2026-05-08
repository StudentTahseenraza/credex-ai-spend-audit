import { connectToDatabase } from '../db/mongodb';
import { Audit } from '../db/models/Audit';
import crypto from 'crypto';

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining?: number }> {
  await connectToDatabase();

  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentAudits = await Audit.countDocuments({
    ipHash,
    createdAt: { $gt: oneHourAgo },
  });

  const limit = 5; // 5 audits per hour per IP

  if (recentAudits >= limit) {
    return { allowed: false };
  }

  return { allowed: true, remaining: limit - recentAudits };
}

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}