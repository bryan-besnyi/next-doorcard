describe("Authentication", () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Registration", () => {
    it("should allow new user registration and redirect to login", () => {
      cy.visit("/register");

      // Fill registration form with unique email
      cy.get('input[name="name"]').type("Test User");
      cy.get('input[name="email"]').type(`test-${Date.now()}@example.com`);
      cy.get('input[name="password"]').type("testpassword123");

      // Submit form
      cy.get('button[type="submit"]').click();

      // Should redirect to login page after successful registration
      cy.url().should("include", "/login");

      // Should show success message
      cy.contains("Account created successfully").should("be.visible");
    });

    it("should prevent registration with existing email", () => {
      cy.visit("/register");

      // Try to register with the hardcoded user's email (should fail)
      cy.get('input[name="name"]').type("Test User");
      cy.get('input[name="email"]').type("besnyib@smccd.edu");
      cy.get('input[name="password"]').type("testpassword123");
      cy.get('button[type="submit"]').click();

      // Should show error message (toast)
      cy.contains("already exists", { timeout: 5000 }).should("be.visible");
    });
  });

  describe("Login", () => {
    it("should allow user login with valid credentials", () => {
      cy.visit("/login");

      // Login with the verified hardcoded user
      cy.get('input[name="email"]').clear().type("besnyib@smccd.edu");
      cy.get('input[name="password"]').clear().type("password123");
      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard
      cy.url().should("include", "/dashboard");
    });

    it("should redirect to login when accessing protected routes", () => {
      // Try to access dashboard without login
      cy.visit("/dashboard");

      // Should redirect to login
      cy.url().should("include", "/login");
    });
  });

  describe("Navigation", () => {
    it("should display the login form correctly", () => {
      cy.visit("/login");

      // Should have form elements
      cy.get('input[name="email"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");

      // Should have the correct title
      cy.contains("Sign in to your account").should("be.visible");
    });
  });
});
