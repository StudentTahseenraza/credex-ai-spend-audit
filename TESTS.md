# Test Suite

## Audit Engine Tests (5+)

| File | Test | Coverage |
|------|------|----------|
| `auditRules.test.ts` | ChatGPT Team → Plus downgrade | ✅ |
| `auditRules.test.ts` | Cursor Business → Pro downgrade | ✅ |
| `auditRules.test.ts` | Enterprise overkill detection | ✅ |
| `auditRules.test.ts` | No downgrade for optimized setups | ✅ |
| `auditRules.test.ts` | Alternative tool suggestions | ✅ |

## How to Run

```bash
# Run all tests
npm test

# Run specific test
npm test -- auditRules.test.ts

# Run with coverage
npm run test:coverage