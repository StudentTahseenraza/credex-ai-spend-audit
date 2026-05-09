import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/mongodb';
import { Audit } from '../../../lib/db/models/Audit';
import { auditTool } from '../../../lib/engine/auditRules';
import { calculateTotalSavings } from '../../../lib/engine/calculateSavings';
import { generateAISummary } from '../../../lib/services/aiSummary';
import { sendAuditConfirmationEmail } from '../../../lib/services/emailService';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Validation schema
const toolInputSchema = z.object({
  name: z.string(),
  plan: z.string(),
  monthlySpend: z.number().min(0),
  seats: z.number().min(1),
});

const auditRequestSchema = z.object({
  tools: z.array(toolInputSchema).min(1),
  teamSize: z.number().min(1),
  useCase: z.string(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = auditRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.message
      }, { status: 400 });
    }
    
    const data = validation.data;
    
    // Run audit engine for each tool
    const toolResults = data.tools.map((tool) => {
      const auditResult = auditTool({
        toolName: tool.name,
        currentPlan: tool.plan,
        seats: tool.seats,
        monthlySpend: tool.monthlySpend,
        useCase: data.useCase,
        teamSize: data.teamSize,
      });

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
    });

    // Calculate totals
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
        currentMonthlySpend: 0,
        recommendedMonthlySpend: 0,
        monthlySavings: t.monthlySavings,
        action: t.action,
        reason: '',
      }))
    );

    // Generate AI summary (with fallback if API fails)
    const aiSummary = await generateAISummary({
      totalMonthlySavings,
      totalAnnualSavings,
      tools: toolSavingsList,
      useCase: data.useCase,
      teamSize: data.teamSize,
    });

    // Generate shareable ID FIRST (before using it)
    const shareableId = nanoid(12);
    
    // Try to save to database if available
    let savedToDb = false;
    const db = await connectToDatabase();
    
    if (db) {
      try {
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
          createdAt: new Date(),
          emailSent: false,
        });
        await audit.save();
        savedToDb = true;
        console.log('✅ Audit saved to database:', shareableId);
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // Continue anyway - we can still return results
      }
    }

    // Send email if email provided
    let emailSent = false;
    let emailMessage = '';

    if (data.email) {
      const emailResult = await sendAuditConfirmationEmail({
        to: data.email,
        shareableId: shareableId,
        totalSavings: totalMonthlySavings,
        totalAnnualSavings: totalAnnualSavings,
        toolsCount: data.tools.length,
        company: data.company,
      });
      
      emailSent = emailResult.success;
      emailMessage = emailResult.message || '';
      
      // Update audit record with email sent status if saved to DB
      if (emailSent && savedToDb && db) {
        await Audit.updateOne({ shareableId }, { emailSent: true });
      }
    }

    // Return results (works even without database)
    return NextResponse.json({
      success: true,
      shareableId,
      totalMonthlySavings,
      totalAnnualSavings,
      tools: toolResults,
      aiSummary,
      savedToDb,
      emailSent,
      emailMessage,
    });
    
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process audit',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}