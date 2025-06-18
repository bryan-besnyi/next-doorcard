/// <reference types="cypress" />

describe("Accessibility Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.injectAxe();
  });

  it("should have no accessibility violations on home page", () => {
    cy.checkA11y();
  });

  it("should have no accessibility violations on login page", () => {
    cy.visit("/login");
    cy.checkA11y();
  });

  it("should have no accessibility violations on register page", () => {
    cy.visit("/register");
    cy.checkA11y();
  });

  it("should test keyboard navigation on main pages", () => {
    cy.visit("/login");

    // Test tab navigation
    cy.get("body").tab();
    cy.focused().should("have.attr", "name", "email");

    cy.get("body").tab();
    cy.focused().should("have.attr", "name", "password");

    cy.get("body").tab();
    cy.focused().should("have.attr", "type", "submit");
  });

  it("should have proper ARIA labels and roles", () => {
    cy.visit("/login");

    // Check for required ARIA attributes
    cy.get("form").should("have.attr", "role");
    cy.get('input[name="email"]').should("have.attr", "aria-label");
    cy.get('input[name="password"]').should("have.attr", "aria-label");

    // Check for proper heading structure
    cy.get("h1").should("exist");
  });

  it("should have sufficient color contrast", () => {
    cy.visit("/");

    // Check color contrast using axe
    cy.checkA11y(null, {
      rules: {
        "color-contrast": { enabled: true },
      },
    });
  });

  it("should support screen readers", () => {
    cy.visit("/login");

    // Check for screen reader content
    cy.get("[aria-describedby]").should("exist");
    cy.get("[aria-labelledby]").should("exist").or("not.exist"); // Optional

    // Check that all interactive elements have accessible names
    cy.get("button, input, select, textarea").each(($el) => {
      cy.wrap($el).should("satisfy", ($element) => {
        const element = $element[0];
        return (
          element.getAttribute("aria-label") ||
          element.getAttribute("aria-labelledby") ||
          element.getAttribute("title") ||
          element.textContent?.trim() ||
          element.getAttribute("placeholder")
        );
      });
    });
  });
});
