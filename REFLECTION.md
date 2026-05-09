# Reflection

## 1. Hardest Bug & Debugging Process

**Bug:** Infinite loop in results page causing "Maximum call stack size exceeded"

**Hypotheses:**
1. useEffect dependency array missing
2. useState setter triggering re-render loop
3. Recursive component rendering

**Debugging steps:**
1. Added console.logs to track renders
2. Used React DevTools to identify component causing loop
3. Isolated the issue to `fetchAudit` being called infinitely
4. Fixed by adding `useCallback` and proper dependencies

**What worked:** Moving fetchAudit outside component with useCallback

**Lesson:** Always memoize functions used in useEffect

## 2. Decision Reversed

**Initial decision:** Use AI for entire audit logic
**Reversed to:** Hardcoded rules for pricing comparisons

**Why reversed:** 
- AI hallucinated pricing data (wrong numbers)
- Finance people need defensible, traceable logic
- Assignment explicitly required hardcoded rules for audit engine

**Impact:** System is more reliable and auditable

## 3. Week 2 Builds

1. **Multi-company benchmarking** - Compare against similar startups
2. **Slack bot integration** - "/audit my spend" command
3. **Automated monthly reports** - Track spend trends over time
4. **API for partners** - Let other tools embed audit

## 4. AI Usage

**Tools used:** Cursor, ChatGPT, Claude, GitHub Copilot

**Tasks for AI:**
- Boilerplate code generation
- Test writing
- Documentation templates
- Debugging suggestions

**What I didn't trust AI with:**
- Audit pricing logic (needs precise numbers)
- Database schema (needs careful relationships)
- Rate limiting logic (critical for production)

**AI was wrong when:** It suggested using localStorage for the entire audit persistence, but I caught it during code review.

## 5. Self-Rating

- **Discipline (9/10)** - Made commits 7 days straight, documented daily
- **Code Quality (8/10)** - TypeScript everywhere, tests passing, but could refactor some components
- **Design Sense (8/10)** - Clean Tailwind UI, but charts could be more interactive
- **Problem-Solving (9/10)** - Fixed infinite loop, rate limiting, AI fallback gracefully
- **Entrepreneurial Thinking (9/10)** - Built viral loop (shareable URLs), lead capture after value, referral program