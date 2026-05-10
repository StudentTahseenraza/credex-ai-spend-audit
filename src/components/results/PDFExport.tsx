'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';

interface ToolRecommendation {
  action: string;
  suggestedPlan?: string;
  suggestedTool?: string;
  monthlySavings: number;
  reason: string;
}

interface Tool {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  recommendation?: ToolRecommendation;
}

interface AuditData {
  shareableId: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  tools: Tool[];
  aiSummary: string;
  teamSize: number;
  useCase: string;
}

interface PDFExportProps {
  audit: AuditData;
}

export function PDFExport({ audit }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generatePDF = async (): Promise<void> => {
    setIsGenerating(true);
    
    try {
      // Dynamically import html2canvas and jspdf
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Create a styled container for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      // Format tool data
      const toolsHtml = audit.tools.map((tool: Tool) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0;">
              ${tool.name.toUpperCase()}
            </h3>
            ${tool.recommendation && tool.recommendation.monthlySavings > 0 ? `
              <span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                Save $${tool.recommendation.monthlySavings}/month
              </span>
            ` : `
              <span style="background: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                Optimized
              </span>
            `}
          </div>
          <p style="margin: 8px 0; font-size: 14px; color: #4b5563;">
            <strong>Current Plan:</strong> ${tool.plan}
          </p>
          <p style="margin: 8px 0; font-size: 14px; color: #4b5563;">
            <strong>Monthly Spend:</strong> $${tool.monthlySpend}
          </p>
          ${tool.recommendation && tool.recommendation.monthlySavings > 0 ? `
            <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; margin-top: 12px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #166534;">
                Recommendation: ${tool.recommendation.action} to ${tool.recommendation.suggestedPlan || tool.recommendation.suggestedTool || 'Better Plan'}
              </p>
              <p style="margin: 0; font-size: 13px; color: #15803d;">${tool.recommendation.reason}</p>
            </div>
          ` : ''}
        </div>
      `).join('');
      
      // Build complete PDF HTML
      pdfContainer.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 2px solid #e5e7eb;">
            <h1 style="font-size: 28px; font-weight: bold; color: #2563eb; margin: 0 0 8px 0;">
              AI Spend Audit Report
            </h1>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0 0;">
              Report ID: ${audit.shareableId}
            </p>
          </div>

          <!-- Savings Hero -->
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; font-weight: bold; color: #065f46; margin-bottom: 8px;">
              ${audit.totalMonthlySavings > 0 ? `Save $${audit.totalMonthlySavings}/month` : 'Already Optimized'}
            </div>
            <div style="font-size: 20px; color: #065f46; margin-bottom: 8px;">
              $${audit.totalAnnualSavings}/year in potential savings
            </div>
            <div style="font-size: 14px; color: #047857;">
              ${audit.totalMonthlySavings > 0 ? 'Based on your actual usage patterns' : 'Your AI stack is well-optimized'}
            </div>
          </div>

          <!-- Team Overview -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0;">
              Team Overview
            </h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Team Size</p>
                <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">${audit.teamSize} people</p>
              </div>
              <div>
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Primary Use Case</p>
                <p style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 0; text-transform: capitalize;">${audit.useCase}</p>
              </div>
            </div>
          </div>

          <!-- Per-Tool Analysis -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0;">
              Per-Tool Analysis
            </h2>
            ${toolsHtml}
          </div>

          <!-- AI Summary -->
          <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #5b21b6; margin: 0 0 12px 0;">
              🤖 AI Executive Summary
            </h2>
            <p style="font-size: 14px; color: #4c1d95; line-height: 1.6; margin: 0;">
              ${audit.aiSummary}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Generated by Credex AI Spend Audit
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">
              credex.rocks · Audit ID: ${audit.shareableId}
            </p>
          </div>
        </div>
      `;
      
      document.body.appendChild(pdfContainer);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture as canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
      });
      
      document.body.removeChild(pdfContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`ai-spend-audit-${audit.shareableId}.pdf`);
      
    } catch (error) {
      console.error('PDF generation failed:', error instanceof Error ? error.message : error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex-1"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating PDF...' : 'Export PDF'}
    </Button>
  );
}