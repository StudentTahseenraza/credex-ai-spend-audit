import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/mongodb';
import { Audit } from '../../../lib/db/models/Audit';
import { auditTool } from '../../../lib/engine/auditRules';
import { calculateToolSavings, calculateTotalSavings } from '../../../lib/engine/calculateSavings';
import { generateAISummary } from '../../../lib/services/aiSummary';
import { sendAuditConfirmationEmail } from '../../../lib/services/emailService';
import { checkRateLimit, hashIP } from '../../../lib/utils/rateLimit';
import { auditRequestSchema } from '../../../lib/validations/audit';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate input
  const validation = auditRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors }, { status: 400 });
  }

  const data = validation.data;

  // Run audit engine for each tool
  const toolResults = await Promise.all(
    data.tools.map(async (tool) => {
      const auditResult = auditTool({
        toolName: tool.name,
        currentPlan: tool.plan,
        seats: tool.seats,
        monthlySpend: tool.monthlySpend,
        useCase: data.useCase,
        teamSize: data.teamSize,
      });

      const savings = calculateToolSavings(tool.name, tool.monthlySpend, auditResult);

      return {
        name: tool.name,
        plan: tool.plan,
        monthlySpend: tool.monthlySpend,
        seats: tool.seats,
        recommendation: {
          action: auditResult.action,
          suggestedTool: auditResult.suggestedTool,
          suggestedPlan: auditResult.suggestedPlan,
          monthlySavings: auditResult.monthlySavings,
          reason: auditResult.reason,
        },
      };
    })
  );

  const toolSavingsList = toolResults.map((t) => ({
    name: t.name,
    action: t.recommendation.action,
    suggestedPlan: t.recommendation.suggestedPlan,
    suggestedTool: t.recommendation.suggestedTool,
    monthlySavings: t.recommendation.monthlySavings,
  }));

  const { totalMonthlySavings, totalAnnualSavings } = calculateTotalSavings(
    toolSavingsList.map((t) => ({
      toolName: t.name,
      currentMonthlySpend: 0, // Not needed for total calc
      recommendedMonthlySpend: 0,
      monthlySavings: t.monthlySavings,
      action: t.action,
      reason: '',
    }))
  );

  // Generate AI summary
  const aiSummary = await generateAISummary({
    totalMonthlySavings,
    totalAnnualSavings,
    tools: toolSavingsList,
    useCase: data.useCase,
    teamSize: data.teamSize,
  });

  // Save to database
  await connectToDatabase();

  const shareableId = nanoid(12);
  const audit = new Audit({
    shareableId,
    email: data.email,
    company: data.company,
    role: data.role,
    teamSize: data.teamSize,
    useCase: data.useCase,
    tools: toolResults,
    totalMonthlySavings,
    totalAnnualSavings,
    aiSummary,
    ipHash: hashIP(ip),
    emailSent: false,
  });

  await audit.save();

  // Send email if email provided
  let emailSent = false;
  if (data.email) {
    const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL}/audit/${shareableId}`;
    emailSent = await sendAuditConfirmationEmail({
      to: data.email,
      auditId: audit._id.toString(),
      shareableUrl,
      totalSavings: totalMonthlySavings,
    });
    audit.emailSent = emailSent;
    await audit.save();
  }

  return NextResponse.json({
    success: true,
    shareableId,
    totalMonthlySavings,
    totalAnnualSavings,
    tools: toolResults,
    aiSummary,
    emailSent,
  });
}