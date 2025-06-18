/// <reference types="cypress" />

describe("Performance Tests", () => {
  it("should load home page within acceptable time", () => {
    const start = Date.now();

    cy.visit("/");

    cy.get("body")
      .should("be.visible")
      .then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
        cy.task("log", `Home page loaded in ${loadTime}ms`);
      });
  });

  it("should load dashboard page within acceptable time for authenticated users", () => {
    // First create and login user
    cy.request("POST", "/api/register", {
      name: "Performance Test User",
      email: "perf-test@example.com",
      password: "testpassword123",
    });

    cy.visit("/login");
    cy.get('input[name="email"]').type("perf-test@example.com");
    cy.get('input[name="password"]').type("testpassword123");
    cy.get('button[type="submit"]').click();

    const start = Date.now();

    cy.visit("/dashboard");

    cy.get('[data-testid="dashboard-content"]')
      .should("be.visible")
      .then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(5000); // Dashboard should load within 5 seconds
        cy.task("log", `Dashboard loaded in ${loadTime}ms`);
      });
  });

  it("should handle form submissions efficiently", () => {
    cy.visit("/register");

    const start = Date.now();

    cy.get('input[name="name"]').type("Speed Test User");
    cy.get('input[name="email"]').type(`speed-${Date.now()}@example.com`);
    cy.get('input[name="password"]').type("testpassword123");
    cy.get('button[type="submit"]').click();

    cy.url()
      .should("include", "/dashboard")
      .then(() => {
        const submitTime = Date.now() - start;
        expect(submitTime).to.be.lessThan(10000); // Form submission should complete within 10 seconds
        cy.task("log", `Registration completed in ${submitTime}ms`);
      });
  });

  it("should not have excessive bundle size", () => {
    cy.visit("/");

    // Check network requests for large bundles
    cy.window().then((win) => {
      const resources = win.performance.getEntriesByType("resource");
      const jsFiles = resources.filter(
        (resource) => resource.name.includes(".js") && resource.transferSize
      );

      jsFiles.forEach((file: any) => {
        // Log large JavaScript files
        if (file.transferSize > 500000) {
          // 500KB
          cy.task(
            "log",
            `Large JS file detected: ${file.name} (${Math.round(
              file.transferSize / 1024
            )}KB)`
          );
        }

        // Warn about very large files
        expect(file.transferSize).to.be.lessThan(2000000); // 2MB max for any single JS file
      });
    });
  });

  it("should measure Core Web Vitals", () => {
    cy.visit("/");

    cy.window().then((win) => {
      // Wait for page to be fully loaded
      cy.wait(3000);

      // Measure Largest Contentful Paint (LCP)
      new Promise((resolve) => {
        new win.PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;

          cy.task("log", `LCP: ${Math.round(lcp)}ms`);
          expect(lcp).to.be.lessThan(2500); // Good LCP is under 2.5s
          resolve(lcp);
        }).observe({ entryTypes: ["largest-contentful-paint"] });
      });

      // Measure First Input Delay would require actual user interaction
      // This is more complex to test programmatically

      // Measure Cumulative Layout Shift
      new Promise((resolve) => {
        let cls = 0;
        new win.PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }

          cy.task("log", `CLS: ${cls.toFixed(4)}`);
          expect(cls).to.be.lessThan(0.1); // Good CLS is under 0.1
          resolve(cls);
        }).observe({ entryTypes: ["layout-shift"] });
      });
    });
  });

  it("should handle concurrent users efficiently", () => {
    // Simulate multiple concurrent requests
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(
        cy.request({
          method: "POST",
          url: "/api/register",
          body: {
            name: `Concurrent User ${i}`,
            email: `concurrent-${i}-${Date.now()}@example.com`,
            password: "testpassword123",
          },
          failOnStatusCode: false,
        })
      );
    }

    // All requests should complete within reasonable time
    cy.wrap(Promise.all(promises)).then((responses) => {
      responses.forEach((response, index) => {
        cy.task(
          "log",
          `Concurrent request ${index} status: ${response.status}`
        );
        expect([200, 201, 409]).to.include(response.status); // Success or conflict (email exists)
      });
    });
  });
});
