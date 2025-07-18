// cypress/support/e2e.js

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // This is useful for handling expected errors from module federation
  if (err.message.includes('Loading chunk')) {
    return false;
  }
  if (err.message.includes('ChunkLoadError')) {
    return false;
  }
  return true;
});

// Global beforeEach hook
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Set up API interceptors for common endpoints
  cy.intercept('GET', '/api/auth/me').as('getUser');
  cy.intercept('POST', '/api/auth/login').as('login');
  cy.intercept('POST', '/api/auth/logout').as('logout');
  cy.intercept('GET', '/api/tickets').as('getTickets');
  cy.intercept('POST', '/api/tickets').as('createTicket');
  cy.intercept('PUT', '/api/tickets/*').as('updateTicket');
  cy.intercept('DELETE', '/api/tickets/*').as('deleteTicket');
  cy.intercept('GET', '/me/screens').as('getScreens');
});

// Global afterEach hook
afterEach(() => {
  // Take screenshot on failure
  cy.screenshot({ capture: 'runner', onlyOnFailure: true });
});

// Add custom assertions
chai.use(function (chai, utils) {
  chai.Assertion.addMethod('toBeVisible', function () {
    const obj = this._obj;
    this.assert(
      obj.is(':visible'),
      'expected #{this} to be visible',
      'expected #{this} to not be visible'
    );
  });
});

// Helper functions
Cypress.Commands.add('waitForApp', () => {
  cy.get('[data-testid="app-loaded"]', { timeout: 10000 }).should('exist');
});

Cypress.Commands.add('checkAccessibility', () => {
  // Basic accessibility checks
  cy.get('main').should('exist');
  cy.get('h1, h2, h3').should('exist');
  cy.get('button').should('have.attr', 'type');
  cy.get('input').should('have.attr', 'type');
  cy.get('a').should('have.attr', 'href');
});

Cypress.Commands.add('mockSuccessfulWorkflow', () => {
  cy.intercept('POST', '/webhook/ticket-done', {
    statusCode: 200,
    body: { success: true, message: 'Workflow completed' }
  }).as('workflowCallback');
});

Cypress.Commands.add('mockFailedWorkflow', () => {
  cy.intercept('POST', '/webhook/ticket-done', {
    statusCode: 500,
    body: { error: 'Workflow failed' }
  }).as('workflowCallbackFailed');
});

// Performance monitoring
Cypress.Commands.add('measurePerformance', (label) => {
  cy.window().then((win) => {
    win.performance.mark(`${label}-start`);
  });
  
  return cy.then(() => {
    cy.window().then((win) => {
      win.performance.mark(`${label}-end`);
      win.performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = win.performance.getEntriesByName(label)[0];
      cy.log(`Performance ${label}: ${measure.duration}ms`);
    });
  });
});

// Database helpers
Cypress.Commands.add('seedDatabase', () => {
  cy.exec('docker-compose exec -T api npm run seed');
});

Cypress.Commands.add('clearDatabase', () => {
  cy.request('DELETE', '/api/test/clear-database');
});

// Wait for specific conditions
Cypress.Commands.add('waitForTicketLoad', () => {
  cy.get('[data-testid="ticket-card"]', { timeout: 10000 }).should('exist');
});

Cypress.Commands.add('waitForStatisticsLoad', () => {
  cy.get('[data-testid="ticket-stats"]', { timeout: 10000 }).should('exist');
});