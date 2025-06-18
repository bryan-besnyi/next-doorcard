import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    testIsolation: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      // Environment variables for testing
      TEST_USER_EMAIL: "test@example.com",
      TEST_USER_PASSWORD: "testpassword123",
    },
    setupNodeEvents(on: any, config: any) {
      // Task for logging messages
      on("task", {
        log(message: any) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },
  // Global configuration
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  pageLoadTimeout: 30000,
  // Browser settings
  chromeWebSecurity: false,
  // Folder structure
  fixturesFolder: "cypress/fixtures",
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
});
