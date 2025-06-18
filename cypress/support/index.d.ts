/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in a user
     * @example cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;

    /**
     * Custom command to login as the verified test user
     * @example cy.loginAsTestUser()
     */
    loginAsTestUser(): Chainable<void>;

    /**
     * Custom command to create a test user
     * @example cy.createTestUser()
     */
    createTestUser(): Chainable<void>;

    /**
     * Custom command to check accessibility violations
     * @example cy.checkA11y()
     */
    checkA11y(): Chainable<void>;

    /**
     * Custom command to wait for page to be fully loaded
     * @example cy.waitForPageLoad()
     */
    waitForPageLoad(): Chainable<void>;
  }
}
