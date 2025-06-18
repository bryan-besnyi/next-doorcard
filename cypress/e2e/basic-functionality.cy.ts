/// <reference types="cypress" />

describe("Basic Functionality Tests", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should load the home page successfully", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });

  it("should navigate to login page", () => {
    cy.visit("/");
    cy.contains("Login").click();
    cy.url().should("include", "/login");
  });

  it("should navigate to register page", () => {
    cy.visit("/");
    cy.contains("Register").click();
    cy.url().should("include", "/register");
  });

  it("should show login form elements", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("should show register form elements", () => {
    cy.visit("/register");
    cy.get('input[name="name"]').should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("should redirect to login when accessing protected routes", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("should handle form input properly", () => {
    cy.visit("/login");

    const testEmail = "test@example.com";
    const testPassword = "testpassword";

    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="email"]').should("have.value", testEmail);

    cy.get('input[name="password"]').type(testPassword);
    cy.get('input[name="password"]').should("have.value", testPassword);
  });

  it("should be responsive on different screen sizes", () => {
    // Test mobile view
    cy.viewport(375, 667);
    cy.visit("/");
    cy.get("body").should("be.visible");

    // Test tablet view
    cy.viewport(768, 1024);
    cy.visit("/");
    cy.get("body").should("be.visible");

    // Test desktop view
    cy.viewport(1920, 1080);
    cy.visit("/");
    cy.get("body").should("be.visible");
  });

  it("should load CSS and assets properly", () => {
    cy.visit("/");

    // Check that styles are loaded
    cy.get("body").should("have.css", "margin").and("not.be.empty");

    // Check for basic styling
    cy.get("body").should("not.have.css", "display", "none");
  });
});
