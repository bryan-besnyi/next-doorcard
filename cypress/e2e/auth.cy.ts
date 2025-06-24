describe("Authentication", () => {
  beforeEach(() => {
    // cy.session is cleared between specs, but not between tests in the same spec
    // We can visit a page to start with a clean slate
    cy.visit("/login");
  });

  describe("Registration", () => {
    it("should show validation messages for empty fields", () => {
      cy.visit("/register");
      cy.get('button[type="submit"]').click();
      cy.get("input:invalid").should("have.length", 3);
    });

    it("should allow new user registration and then login", () => {
      const email = `test-${Date.now()}@example.com`;
      const password = "password123";

      // Register
      cy.visit("/register");
      cy.get('input[name="name"]').type("New User");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();

      // Should be on login page with success message
      cy.url().should("include", "/login");
      cy.contains("Account created successfully").should("be.visible");

      // Login
      cy.login(email, password);
      cy.visit("/dashboard");
      cy.contains("h1", "Welcome, New User").should("be.visible");
    });

    it("should prevent registration with an existing email", () => {
      cy.visit("/register");
      cy.get('input[name="name"]').type("Another User");
      cy.get('input[name="email"]').type("besnyib@smccd.edu"); // Seeded user
      cy.get('input[name="password"]').type("password456");
      cy.get('button[type="submit"]').click();

      cy.contains("Email already exists").should("be.visible");
    });
  });

  describe("Login and Logout", () => {
    it("should allow a seeded user to log in and log out", () => {
      cy.login("besnyib@smccd.edu", "password123");
      cy.visit("/dashboard");

      // Verify login
      cy.contains("h1", "Welcome, Benjamin Besnyik").should("be.visible");

      // Logout
      cy.contains("button", "Logout").click();
      cy.url().should("include", "/login"); // Should redirect to login after logout
    });

    it("should show an error for invalid credentials", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("wrong@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.get('[data-testid="login-error"]').should("be.visible");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect unauthenticated users to the login page", () => {
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });
  });
});
