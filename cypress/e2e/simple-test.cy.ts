describe("Simple Test", () => {
  it("should visit the home page", () => {
    cy.visit("/");
    cy.contains("body").should("exist");
  });

  it("should visit the login page", () => {
    cy.visit("/login");
    cy.get("body").should("be.visible");
  });
});
