describe("Debug Print Layout", () => {
  beforeEach(() => {
    cy.visit("/view/benjamin-besnyik-fall-2024");
  });

  it("should take screenshot of current page layout", () => {
    cy.wait(2000); // Wait for page to load
    cy.screenshot("current-page-layout");
  });

  it("should inspect print styles and background", () => {
    cy.wait(2000);

    // Take screenshot of normal view
    cy.screenshot("normal-view");

    // Check if the page has gray background
    cy.get("body").should("be.visible");
    cy.get("div")
      .first()
      .then(($div) => {
        const bgColor = $div.css("background-color");
        cy.log("Page background color:", bgColor);
      });

    // Find the main container and check its background
    cy.get(".printable-doorcard")
      .should("exist")
      .then(($container) => {
        const bgColor = $container.css("background-color");
        cy.log("Container background color:", bgColor);
      });

    // Find the table and check its styling
    cy.get("table")
      .should("exist")
      .then(($table) => {
        const bgColor = $table.css("background-color");
        cy.log("Table background color:", bgColor);
      });

    // Check if print styles are being applied
    cy.window().then((win) => {
      const printStyleEl = win.document.querySelector("style[jsx]");
      if (printStyleEl) {
        cy.log("Print styles found:", printStyleEl.innerHTML.substring(0, 200));
      } else {
        cy.log("No print styles found");
      }
    });
  });

  it("should test print preview simulation", () => {
    cy.wait(2000);

    // Simulate print media query by adding CSS
    cy.window().then((win) => {
      const style = win.document.createElement("style");
      style.innerHTML = `
        @media screen {
          body { background: white !important; }
          .printable-doorcard { background: white !important; }
          .printable-doorcard table { background: white !important; }
          .printable-doorcard th { background-color: white !important; }
          .printable-doorcard td { background: white !important; }
          .printable-doorcard .bg-gray-100 { background-color: white !important; }
        }
      `;
      win.document.head.appendChild(style);
    });

    cy.wait(1000);
    cy.screenshot("simulated-print-view");
  });

  it("should check view page structure", () => {
    cy.wait(2000);

    // Check main page structure
    cy.get("body").should("have.class", "min-h-screen");

    // Look for the main container div
    cy.get('div[class*="min-h-screen"]')
      .should("exist")
      .then(($div) => {
        const classes = $div.attr("class");
        cy.log("Main container classes:", classes);

        if (classes && classes.includes("bg-gray")) {
          cy.log("FOUND ISSUE: Main container has gray background");
        }
      });

    // Check for any gray background classes
    cy.get("div").each(($el) => {
      const classes = $el.attr("class") || "";
      if (classes.includes("bg-gray")) {
        cy.log("Element with gray background found:", classes);
      }
    });

    cy.screenshot("page-structure-analysis");
  });
});
