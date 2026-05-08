import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import { Audit } from '../../../../lib/db/models/Audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  await connectToDatabase();

  const audit = await Audit.findOne({ shareableId: id });

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // Return public version (no email/company/role/IP)
  return NextResponse.json({
    shareableId: audit.shareableId,
    createdAt: audit.createdAt,
    teamSize: audit.teamSize,
    useCase: audit.useCase,
    tools: audit.tools.map((t: any) => ({
      name: t.name,
      recommendation: t.recommendation,
    })),
    totalMonthlySavings: audit.totalMonthlySavings,
    totalAnnualSavings: audit.totalAnnualSavings,
    aiSummary: audit.aiSummary,
  });
}