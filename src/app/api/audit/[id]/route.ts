import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import { Audit } from '../../../../lib/db/models/Audit';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
  tools: audit.tools.map(
    (t: {
      name: string;
      plan: string;
      monthlySpend: number;
      seats: number;
      recommendation: unknown;
    }) => ({
      name: t.name,
      plan: t.plan,
      monthlySpend: t.monthlySpend,
      seats: t.seats,
      recommendation: t.recommendation,
    })
  ),
});
}