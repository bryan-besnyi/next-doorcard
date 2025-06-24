describe("Print Layout Screenshots", () => {
  it("should capture current print layout for analysis", () => {
    cy.visit("/view/benjamin-besnyik-fall-2024");
    cy.wait(2000); // Wait for page to load completely

    // Take screenshot of normal view
    cy.screenshot("print-layout-normal-view", {
      capture: "fullPage",
      clip: { x: 0, y: 0, width: 1000, height: 2000 },
    });

    // Click the print button to trigger print view
    cy.get("button").contains("Print").click();
    cy.wait(1000);

    // Take screenshot of print view
    cy.screenshot("print-layout-print-view", {
      capture: "fullPage",
    });

    // Test print preview by adding print media styles temporarily
    cy.window().then((win) => {
      const style = win.document.createElement("style");
      style.id = "print-test-styles";
      style.innerHTML = `
        body, html { background: white !important; }
        .bg-gray-50, .bg-gray-100 { background: white !important; }
        .min-h-screen { background: white !important; }
        @media screen {
          body { background: white !important; }
          .printable-doorcard { background: white !important; }
        }
      `;
      win.document.head.appendChild(style);
    });

    cy.wait(1000);
    cy.screenshot("print-layout-white-background-test", {
      capture: "fullPage",
    });

    // Log some diagnostic info
    cy.get("body").then(($body) => {
      const bgColor = $body.css("background-color");
      cy.log("Body background color:", bgColor);

      const className = $body.attr("class");
      cy.log("Body classes:", className);
    });
  });
});
