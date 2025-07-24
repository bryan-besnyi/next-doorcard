/// <reference types="cypress" />

// Custom command to log in a user
Cypress.Commands.add("login", (email, password) => {
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

// Custom command to log in as the main test user
Cypress.Commands.add("loginAsTestUser", () => {
  cy.login("besnyib@smccd.edu", "password123");
  cy.visit("/dashboard");
});

export {};
