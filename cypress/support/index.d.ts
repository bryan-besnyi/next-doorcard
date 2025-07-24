/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password?: string): Chainable<void>;
    loginAsTestUser(): Chainable<void>;
  }
}
