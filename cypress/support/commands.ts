/// <reference types="cypress" />
/// <reference types="cypress-axe" />

Cypress.Commands.add("login", (email: string, password?: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit("/login");
      cy.get('input[name="email"]').clear().type(email);
      if (password) {
        cy.get('input[name="password"]').clear().type(password);
      }
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/dashboard");
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.getCookie("next-auth.session-token").should("exist");
      },
    }
  );
});

Cypress.Commands.add("loginAsTestUser", () => {
  cy.login("besnyib@smccd.edu", "password123");
  cy.visit("/dashboard");
});

Cypress.Commands.add("createTestUser", () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  cy.visit("/register");
  cy.get('input[name="name"]').type("Test User");
  cy.get('input[name="email"]').type(uniqueEmail);
  cy.get('input[name="password"]').type("testpassword123");
  cy.get('button[type="submit"]').click();
  cy.url().should("contain", "/dashboard");
});

Cypress.Commands.add("checkA11y", () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add("waitForPageLoad", () => {
  cy.get('[data-testid="page-loaded"]', { timeout: 10000 }).should("exist");
});

export {};
