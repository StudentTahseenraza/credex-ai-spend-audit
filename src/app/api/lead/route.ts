import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/mongodb';
import { Lead } from '../../../lib/db/models/Lead';
import { Audit } from '../../../lib/db/models/Audit';
import { z } from 'zod';

const leadSchema = z.object({
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  auditId: z.string(),
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = leadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors }, { status: 400 });
  }

  const { email, company, role, auditId } = validation.data;

  await connectToDatabase();

  // Verify audit exists
  const audit = await Audit.findOne({ shareableId: auditId });
  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // Create lead
  const lead = new Lead({
    email,
    company,
    role,
    auditId: audit._id,
    savingsAmount: audit.totalMonthlySavings,
  });

  await lead.save();

  // Update audit with email if not already present
  if (!audit.email) {
    audit.email = email;
    await audit.save();
  }

  return NextResponse.json({ success: true, leadId: lead._id });
}