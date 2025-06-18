# Cypress E2E Testing Setup

This directory contains End-to-End tests for the Next.js Doorcard application using Cypress. The test suite focuses on ADA compliance, performance, and core functionality.

## Quick Start

### Running Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run tests in headless mode
npm run cypress:run

# Run tests with development server
npm run test:e2e
```

## Test Structure

### Core Test Files

- **basic-functionality.cy.ts** - Basic user flows and navigation
- **accessibility.cy.ts** - ADA compliance and accessibility testing
- **performance.cy.ts** - Performance metrics and load time testing
- **auth.cy.ts** - Authentication flows (login, register, logout)

### Test Categories

#### 1. Accessibility Testing
Tests ensure ADA compliance including:
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- ARIA labels and roles

#### 2. Performance Testing
Monitors application performance:
- Page load times
- Core Web Vitals (LCP, CLS)
- Bundle size analysis
- Concurrent user handling

#### 3. Functional Testing
Covers core user journeys:
- User registration and login
- Doorcard creation and editing
- Navigation and routing
- Form validation

## Configuration

Environment variables in cypress.config.ts:
- TEST_USER_EMAIL: 'test@example.com'
- TEST_USER_PASSWORD: 'testpassword123'

## Best Practices

1. Use data-testid attributes for reliable element selection
2. Keep tests independent and atomic
3. Run accessibility checks on all major pages
4. Set reasonable performance budgets
5. Clean up test data after each test

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [cypress-axe Documentation](https://github.com/component-driven/cypress-axe)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) 