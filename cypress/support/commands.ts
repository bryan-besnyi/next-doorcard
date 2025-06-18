/// <reference types="cypress" />
/// <reference types="cypress-axe" />

// Custom command for login
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("not.contain", "/login");
});

// Custom command to login as the verified test user
Cypress.Commands.add("loginAsTestUser", () => {
  cy.login("besnyib@smccd.edu", "password123");
  cy.url().should("contain", "/dashboard");
});

// Custom command for creating a test user with unique email
Cypress.Commands.add("createTestUser", () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  cy.visit("/register");
  cy.get('input[name="name"]').type("Test User");
  cy.get('input[name="email"]').type(uniqueEmail);
  cy.get('input[name="password"]').type("testpassword123");
  cy.get('button[type="submit"]').click();
  cy.url().should("contain", "/dashboard");
});

// Custom command for accessibility testing
Cypress.Commands.add("checkA11y", () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Custom command to wait for page load
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get('[data-testid="page-loaded"]', { timeout: 10000 }).should("exist");
});

export {};
