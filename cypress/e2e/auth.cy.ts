/// <reference types="cypress" />

const TEST_USER_EMAIL = "besnyib@smccd.edu";
const TEST_USER_PASSWORD = "password123";

describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should log in with valid credentials and see dashboard", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(TEST_USER_EMAIL);
    cy.get('input[name="password"]').clear().type(TEST_USER_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.get('[data-cypress-testid="dashboard-heading"]', {
      timeout: 10000,
    }).should("be.visible");
    cy.url().should("include", "/dashboard");
  });

  it("should show error for invalid credentials", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(TEST_USER_EMAIL);
    cy.get('input[name="password"]').clear().type("wrongpassword");
    cy.get('button[type="submit"]').click();
    cy.contains("Invalid email or password").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should persist session on reload", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(TEST_USER_EMAIL);
    cy.get('input[name="password"]').clear().type(TEST_USER_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.get('[data-cypress-testid="dashboard-heading"]', {
      timeout: 10000,
    }).should("be.visible");
    cy.reload();
    cy.get('[data-cypress-testid="dashboard-heading"]', {
      timeout: 10000,
    }).should("be.visible");
    cy.url().should("include", "/dashboard");
  });

  it("should log out and redirect to login", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(TEST_USER_EMAIL);
    cy.get('input[name="password"]').clear().type(TEST_USER_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.get('[data-cypress-testid="dashboard-heading"]', {
      timeout: 10000,
    }).should("be.visible");
    cy.contains("Logout").click();
    cy.url().should("include", "/login", { timeout: 10000 });
    cy.get('input[name="email"]', { timeout: 5000 }).should("be.visible");
  });
});

describe("Login Input Validation", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should show 'Email is required' if email is empty", () => {
    cy.get('input[name="email"]').clear();
    cy.get('input[name="password"]').clear().type("password123");
    cy.get('button[type="submit"]').click();
    cy.contains("Email is required").should("be.visible");
  });

  it("should show 'Enter a valid email' for invalid email format", () => {
    cy.get('input[name="email"]').clear().type("not-an-email");
    cy.get('input[name="password"]').clear().type("password123");
    cy.get('button[type="submit"]').click();
    cy.contains("Enter a valid email").should("be.visible");
  });

  it("should show 'Password is required' if password is empty", () => {
    cy.get('input[name="email"]').clear().type("besnyib@smccd.edu");
    cy.get('input[name="password"]').clear();
    cy.get('button[type="submit"]').click();
    cy.contains("Password is required").should("be.visible");
  });
});

describe("Login Button Loading State", () => {
  it("should disable the button and show 'Signing in...' while login is processing (success)", () => {
    cy.visit("/login");
    // Intercept the credentials sign-in API and delay the response
    // @ts-expect-error: Cypress custom command
    cy.intercept("POST", "/api/auth/callback/credentials", (req: any) => {
      req.reply((res: any) => {
        setTimeout(() => {
          // Simulate a successful login
          res.send({ statusCode: 200, body: { url: "/dashboard" } });
        }, 2000);
      });
    }).as("signIn");

    cy.get('input[name="email"]').clear().type("besnyib@smccd.edu");
    cy.get('input[name="password"]').clear().type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]')
      .should("be.disabled")
      .and("contain", "Signing in...");
    cy.wait("@signIn");
    cy.url().should("include", "/dashboard");
    cy.get('[data-cypress-testid="dashboard-heading"]', {
      timeout: 10000,
    }).should("be.visible");
  });
});
