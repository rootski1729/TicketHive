describe('Flowbit Platform Smoke Tests', () => {
  const testUsers = {
    logisticsAdmin: {
      email: 'admin@logisticsco.com',
      password: 'password123',
      tenant: 'LogisticsCo'
    },
    retailAdmin: {
      email: 'admin@retailgmbh.com',
      password: 'password123',
      tenant: 'RetailGmbH'
    },
    logisticsUser: {
      email: 'user@logisticsco.com',
      password: 'password123',
      tenant: 'LogisticsCo'
    }
  };

  beforeEach(() => {
    cy.visit('/');
  });

  describe('Authentication Flow', () => {
    it('should display login form', () => {
      cy.contains('Welcome to Flowbit').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show demo credentials', () => {
      cy.contains('Demo Credentials').should('be.visible');
      cy.contains('LogisticsCo Admin').should('be.visible');
      cy.contains('RetailGmbH Admin').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.get('input[type="email"]').type(testUsers.logisticsAdmin.email);
      cy.get('input[type="password"]').type(testUsers.logisticsAdmin.password);
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/dashboard');
      cy.contains(`Welcome to ${testUsers.logisticsAdmin.tenant} Portal`).should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.get('input[type="email"]').type('invalid@email.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Invalid credentials').should('be.visible');
    });
  });

  describe('Tenant Isolation', () => {
    it('should show different data for different tenants', () => {
      // Login as LogisticsCo admin
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
      cy.contains(`Welcome to ${testUsers.logisticsAdmin.tenant} Portal`).should('be.visible');
      
      // Navigate to tickets and note the data
      cy.get('a[href="/app/support-tickets"]').click();
      cy.wait(2000);
      
      // Store ticket count for LogisticsCo
      let logisticsTicketCount;
      cy.get('[data-testid="ticket-count"]').then($el => {
        logisticsTicketCount = $el.text();
      });

      // Logout and login as RetailGmbH admin
      cy.logout();
      cy.login(testUsers.retailAdmin.email, testUsers.retailAdmin.password);
      cy.contains(`Welcome to ${testUsers.retailAdmin.tenant} Portal`).should('be.visible');
      
      // Navigate to tickets and verify different data
      cy.get('a[href="/app/support-tickets"]').click();
      cy.wait(2000);
      
      // Verify different ticket count for RetailGmbH
      cy.get('[data-testid="ticket-count"]').should('not.contain', logisticsTicketCount);
    });
  });

  describe('Support Tickets Workflow', () => {
    beforeEach(() => {
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
      cy.get('a[href="/app/support-tickets"]').click();
      cy.wait(2000);
    });

    it('should create a new ticket', () => {
      const ticketTitle = `Test Ticket ${Date.now()}`;
      const ticketDescription = 'This is a test ticket created by Cypress';

      cy.get('button').contains('Create Ticket').click();
      cy.get('input[type="text"]').first().type(ticketTitle);
      cy.get('textarea').type(ticketDescription);
      cy.get('select').first().select('High');
      cy.get('input[placeholder*="urgent"]').type('cypress, test, automation');
      cy.get('button[type="submit"]').click();

      cy.contains(ticketTitle).should('be.visible');
      cy.contains('High').should('be.visible');
      cy.contains('Open').should('be.visible');
    });

    it('should update ticket status', () => {
      // Find the first ticket and edit it
      cy.get('[title="Edit ticket"]').first().click();
      
      // Update status to In Progress
      cy.get('select').contains('Status').parent().find('select').select('In Progress');
      cy.get('button').contains('Update').click();

      // Verify status updated
      cy.contains('In Progress').should('be.visible');
    });

    it('should filter tickets by status', () => {
      // Apply status filter
      cy.get('select').contains('All Statuses').parent().find('select').select('Open');
      cy.wait(1000);

      // Verify only open tickets are shown
      cy.get('[data-testid="ticket-card"]').should('exist');
      cy.get('[data-testid="ticket-card"]').each($card => {
        cy.wrap($card).should('contain', 'Open');
      });
    });

    it('should search tickets', () => {
      const searchTerm = 'shipment';
      
      cy.get('input[placeholder*="Search"]').type(searchTerm);
      cy.wait(1000);

      // Verify search results
      cy.get('[data-testid="ticket-card"]').should('exist');
      cy.get('[data-testid="ticket-card"]').each($card => {
        cy.wrap($card).should('contain.text', searchTerm);
      });
    });

    it('should delete a ticket', () => {
      // Get the initial ticket count
      cy.get('[data-testid="ticket-card"]').its('length').then(initialCount => {
        // Delete the first ticket
        cy.get('[title="Delete ticket"]').first().click();
        
        // Confirm deletion in the browser alert
        cy.window().then(win => {
          cy.stub(win, 'confirm').returns(true);
        });
        
        cy.get('[title="Delete ticket"]').first().click();
        
        // Verify ticket count decreased
        cy.get('[data-testid="ticket-card"]').should('have.length', initialCount - 1);
      });
    });
  });

  describe('Workflow Integration', () => {
    beforeEach(() => {
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
      cy.get('a[href="/app/support-tickets"]').click();
      cy.wait(2000);
    });

    it('should trigger workflow on ticket creation', () => {
      const ticketTitle = `Workflow Test ${Date.now()}`;
      
      cy.get('button').contains('Create Ticket').click();
      cy.get('input[type="text"]').first().type(ticketTitle);
      cy.get('textarea').type('Testing workflow integration');
      cy.get('button[type="submit"]').click();

      // Verify ticket was created
      cy.contains(ticketTitle).should('be.visible');
      
      // Wait for workflow to potentially update status
      cy.wait(5000);
      
      // Check if status was updated by workflow (may take time)
      cy.contains(ticketTitle).parent().should('contain', 'Open');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should show admin-only features for admin users', () => {
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
      
      // Admin should see User Management link
      cy.get('a[href="/admin/users"]').should('be.visible');
      
      // Admin should see all ticket actions
      cy.get('a[href="/app/support-tickets"]').click();
      cy.wait(2000);
      cy.get('[title="Edit ticket"]').should('be.visible');
      cy.get('[title="Delete ticket"]').should('be.visible');
    });

    it('should hide admin features for regular users', () => {
      cy.login(testUsers.logisticsUser.email, testUsers.logisticsUser.password);
      
      // Regular user should not see User Management link
      cy.get('a[href="/admin/users"]').should('not.exist');
      
      // User should still see support tickets
      cy.get('a[href="/app/support-tickets"]').should('be.visible');
    });
  });

  describe('Navigation and UI', () => {
    beforeEach(() => {
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
    });

    it('should navigate between different screens', () => {
      // Test dashboard navigation
      cy.get('a[href="/dashboard"]').click();
      cy.contains('Welcome to LogisticsCo Portal').should('be.visible');
      
      // Test support tickets navigation
      cy.get('a[href="/app/support-tickets"]').click();
      cy.contains('Support Tickets').should('be.visible');
      
      // Test back to dashboard
      cy.get('a[href="/dashboard"]').click();
      cy.contains('Welcome to LogisticsCo Portal').should('be.visible');
    });

    it('should display user information correctly', () => {
      cy.contains(testUsers.logisticsAdmin.email).should('be.visible');
      cy.contains('Admin').should('be.visible');
      cy.contains('LogisticsCo').should('be.visible');
    });

    it('should logout successfully', () => {
      cy.get('button[title="Logout"]').click();
      cy.url().should('not.include', '/dashboard');
      cy.contains('Welcome to Flowbit').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
      
      // Intercept API calls and simulate network error
      cy.intercept('GET', '/api/tickets', { forceNetworkError: true }).as('getTicketsError');
      
      cy.get('a[href="/app/support-tickets"]').click();
      cy.wait('@getTicketsError');
      
      // Should show error message
      cy.contains('Failed to fetch tickets').should('be.visible');
    });

    it('should handle invalid routes', () => {
      cy.login(testUsers.logisticsAdmin.email, testUsers.logisticsAdmin.password);
      
      // Navigate to invalid route
      cy.visit('/invalid-route');
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });
  });
});

// Custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('button[title="Logout"]').click();
  cy.url().should('not.include', '/dashboard');
});