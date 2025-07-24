/// <reference types="cypress" />

describe("Create New Doorcard", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type("besnyib@smccd.edu");
    cy.get('input[name="password"]').clear().type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");
    // Clean up any existing drafts for the test user (after login)
    cy.request({
      method: "DELETE",
      url: "/api/doorcards/draft?all=true",
      failOnStatusCode: false,
    });
    cy.contains("New Doorcard").click();
  });

  it("should show validation errors for missing required fields", () => {
    cy.contains("button", "Next").click();
    cy.contains("Campus is required").should("be.visible");
    cy.contains("Term is required").should("be.visible");
    cy.contains("Year is required").should("be.visible");
  });

  it("should create a doorcard with valid data", () => {
    cy.get("#college").click();
    cy.contains('[role="option"]', "Cañada College").click();
    cy.get("#term").click();
    cy.contains('[role="option"]', "Fall").click();
    // Dynamically select the next available year
    const nextYear = new Date().getFullYear() + 1;
    cy.get("#year").click();
    cy.contains('[role="option"]', nextYear.toString()).click();
    cy.contains("button", "Next").click();
    // Debug: take a screenshot and log the body HTML after clicking Next
    cy.screenshot("after-next-click");
    cy.get("body").then(($body) => {
      cy.log($body.html());
    });
    cy.get("#name", { timeout: 10000 }).type("Test User");
    cy.get("#doorcardName").type("Test Doorcard");
    cy.get("#officeNumber").type("1234");
    cy.contains("button", "Next").click();
    cy.get("#day").click();
    cy.contains('[role="option"]', "Monday").click();
    cy.get("#activity").click();
    cy.contains('[role="option"]', "Class").click();
    cy.get("#category").click();
    cy.contains('[role="option"]', "Office Hours").click();
    cy.get("#location").type("Room 101");
    cy.get("#startTime").type("09:00");
    cy.get("#endTime").type("10:00");
    cy.contains("button", "Add Time Block").click();
    cy.contains("Monday • 9:00 AM - 10:00 AM").should("be.visible");
    // Go to Preview step
    cy.contains("button", "Next").click();
    // Assert that the time block is rendered in the Preview table
    cy.contains("td", "Monday").should("be.visible");
    cy.contains("td", "Class").should("be.visible");
    cy.contains("td", "Office Hours").should("be.visible");
    cy.contains("td", "Room 101").should("be.visible");
    cy.contains("td", "9:00 AM").should("be.visible");
    cy.contains("td", "10:00 AM").should("be.visible");
    // Go to Print & Export step
    cy.contains("button", "Next").click();
    // Now click Create Doorcard
    cy.contains("button", "Create Doorcard").click();
    cy.url().should("include", "/dashboard");
    cy.contains("Test Doorcard").should("be.visible");
  });
});
