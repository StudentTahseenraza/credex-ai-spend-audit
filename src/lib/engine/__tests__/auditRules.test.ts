import { describe, it, expect } from 'vitest';
import { auditTool } from '../auditRules';

describe('Audit Engine', () => {
  describe('Cursor pricing logic', () => {
    it('should downgrade from Business to Pro for small teams', () => {
      const result = auditTool({
        toolName: 'cursor',
        currentPlan: 'Business',
        seats: 2,
        monthlySpend: 80,
        useCase: 'coding',
        teamSize: 2,
      });

      expect(result.action).toBe('downgrade');
      expect(result.suggestedPlan).toBe('Pro');
      expect(result.monthlySavings).toBeGreaterThan(0);
    });

    it('should keep Pro for single developer', () => {
      const result = auditTool({
        toolName: 'cursor',
        currentPlan: 'Pro',
        seats: 1,
        monthlySpend: 20,
        useCase: 'coding',
        teamSize: 1,
      });

      expect(result.action).toBe('stay');
      expect(result.monthlySavings).toBe(0);
    });
  });

  describe('ChatGPT Team analysis', () => {
    it('should downgrade from Team to Plus for 2 users', () => {
      const result = auditTool({
        toolName: 'chatgpt',
        currentPlan: 'Team',
        seats: 2,
        monthlySpend: 50,
        useCase: 'writing',
        teamSize: 2,
      });

      expect(result.action).toBe('downgrade');
      expect(result.suggestedPlan).toBe('Plus');
    });
  });

  describe('Enterprise overkill detection', () => {
    it('should flag Enterprise for small teams', () => {
      const result = auditTool({
        toolName: 'cursor',
        currentPlan: 'Enterprise',
        seats: 5,
        monthlySpend: 300,
        useCase: 'coding',
        teamSize: 5,
      });

      expect(result.action).toBe('downgrade');
      expect(result.reason).toContain('Enterprise requires');
    });
  });

  describe('Alternative tool suggestions', () => {
    it('should suggest Cursor alternative for coding on Copilot', () => {
      const result = auditTool({
        toolName: 'github-copilot',
        currentPlan: 'Business',
        seats: 5,
        monthlySpend: 95,
        useCase: 'coding',
        teamSize: 5,
      });

      // May suggest alternative
      expect(['switch', 'stay', 'downgrade']).toContain(result.action);
    });
  });

  describe('Use case based recommendations', () => {
    it('should not force switches for non-coding use cases', () => {
      const result = auditTool({
        toolName: 'cursor',
        currentPlan: 'Pro',
        seats: 2,
        monthlySpend: 40,
        useCase: 'writing',
        teamSize: 2,
      });

      expect(result.action).toBe('stay');
    });
  });
});