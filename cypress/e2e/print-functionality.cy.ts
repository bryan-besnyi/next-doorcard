describe("Print Functionality", () => {
  beforeEach(() => {
    // Visit the doorcard view page
    cy.visit("/view/benjamin-besnyik-fall-2024");
    cy.wait(2000); // Wait for page to load
  });

  it("should load the doorcard view page without errors", () => {
    // Check that the page loads without showing error state
    cy.get("body").should("not.contain", "Doorcard not found");
    cy.get("body").should("not.contain", "Loading doorcard...");

    // Check for the main doorcard title
    cy.get("h1").should("contain", "Prof. Besnyik");
  });

  it("should display doorcard with schedule table", () => {
    // Check that the schedule table is visible
    cy.get("table").should("exist").and("be.visible");

    // Check that all 7 day columns are present
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    days.forEach((day) => {
      cy.get("table").find("th").should("contain", day);
    });

    // Check for time column
    cy.get("table").find("th").should("contain", "Time");
  });

  it("should show course activities in the table", () => {
    // Check that the table contains appointment data
    cy.get("table tbody tr").should("have.length.greaterThan", 0);

    // Look for specific content in table cells
    cy.get("table td").should("exist");

    // Check for time entries (should have AM/PM times)
    cy.get("table").should("contain.text", "AM");
  });

  it("should have print button that works", () => {
    // Find and click the print button
    cy.get("button").contains("Print").should("exist").click();

    cy.wait(1000);

    // Should show the print view
    cy.get("body").should("contain", "Back to View");
  });

  it("should have share functionality", () => {
    // Find the share button
    cy.get("button").contains("Share").should("exist");
  });

  it("should display faculty information", () => {
    // Check for faculty name
    cy.get("h1").should("contain", "Prof. Besnyik");

    // Check for office number
    cy.get("body").should("contain", "2320");

    // Check for term/year info
    cy.get("body").should("contain", "Fall 2024");
  });

  it("should show appointment details section", () => {
    // Check for appointment details section
    cy.get("h4").should("contain", "Appointment Details");

    // Check for appointment cards
    cy.get(".bg-gray-50.rounded-lg").should("exist");
  });

  it("should format times correctly", () => {
    // Check that times are formatted with AM/PM
    cy.get("body").should("contain.text", "AM");

    // Check for proper time format (e.g., "10:00 AM")
    cy.get("body")
      .invoke("text")
      .should("match", /\d{1,2}:\d{2}\s(AM|PM)/);
  });

  it("should show badges for appointment categories", () => {
    // Look for category badges using more specific selector
    cy.get("body").should("contain", "Office Hours");
  });

  it("should have active status indicator", () => {
    // Check for status card
    cy.get("h3").should("contain", "Current Status");

    // Should show active or inactive badge
    cy.get("body").should("contain.text", "Active");
  });

  it("should handle print view correctly", () => {
    // Click print button
    cy.get("button").contains("Print").click();

    cy.wait(1000);

    // Should be in print view
    cy.get("button").contains("Back to View").should("exist");

    // Click back
    cy.get("button").contains("Back to View").click();

    // Should return to normal view
    cy.get("button").contains("Print").should("exist");
  });

  it("should navigate to print page directly", () => {
    // First get the doorcard ID from the current page
    cy.visit("/view/benjamin-besnyik-fall-2024");
    cy.wait(2000);

    // Intercept the API call to get the actual doorcard ID
    cy.intercept("GET", "/api/doorcards/public/benjamin-besnyik-fall-2024").as(
      "getDoorcardData"
    );

    cy.reload();
    cy.wait("@getDoorcardData").then((interception) => {
      const doorcardId = interception.response?.body.id;

      if (doorcardId) {
        // Test direct navigation to print page with actual ID
        cy.visit(`/create-doorcard/print?id=${doorcardId}`);
        cy.wait(2000);

        // Should show print layout
        cy.get(".print-container").should("exist");
      }
    });
  });
});
