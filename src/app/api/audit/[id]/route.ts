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

  // Return with ALL fields including monthlySpend
  return NextResponse.json({
    shareableId: audit.shareableId,
    createdAt: audit.createdAt,
    teamSize: audit.teamSize,
    useCase: audit.useCase,
    totalMonthlySavings: audit.totalMonthlySavings,
    totalAnnualSavings: audit.totalAnnualSavings,
    aiSummary: audit.aiSummary,
    tools: audit.tools.map((t: any) => ({
      name: t.name,
      plan: t.plan,
      monthlySpend: t.monthlySpend,  // CRITICAL: Include this
      seats: t.seats,
      recommendation: t.recommendation,
    })),
  });
}