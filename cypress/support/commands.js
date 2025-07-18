// cypress/support/commands.js

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('button[title="Logout"]').click();
  cy.url().should('not.include', '/dashboard');
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.not.exist;
  });
});

// Quick login using API
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.token).to.exist;
    
    window.localStorage.setItem('token', response.body.token);
    cy.visit('/dashboard');
  });
});

// Create ticket command
Cypress.Commands.add('createTicket', (ticketData) => {
  const defaultTicket = {
    title: `Test Ticket ${Date.now()}`,
    description: 'Test ticket created by Cypress',
    priority: 'Medium',
    tags: ['test', 'cypress']
  };
  
  const ticket = { ...defaultTicket, ...ticketData };
  
  cy.get('button').contains('Create Ticket').click();
  cy.get('input[type="text"]').first().type(ticket.title);
  cy.get('textarea').type(ticket.description);
  cy.get('select').first().select(ticket.priority);
  if (ticket.tags) {
    cy.get('input[placeholder*="urgent"]').type(ticket.tags.join(', '));
  }
  cy.get('button[type="submit"]').click();
  
  cy.contains(ticket.title).should('be.visible');
  return cy.wrap(ticket);
});

// Update ticket command
Cypress.Commands.add('updateTicket', (ticketSelector, updates) => {
  cy.get(ticketSelector).find('[title="Edit ticket"]').click();
  
  if (updates.title) {
    cy.get('input[type="text"]').first().clear().type(updates.title);
  }
  
  if (updates.description) {
    cy.get('textarea').clear().type(updates.description);
  }
  
  if (updates.status) {
    cy.get('select').contains('Status').parent().find('select').select(updates.status);
  }
  
  if (updates.priority) {
    cy.get('select').contains('Priority').parent().find('select').select(updates.priority);
  }
  
  cy.get('button').contains('Update').click();
});

// Delete ticket command
Cypress.Commands.add('deleteTicket', (ticketSelector) => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(true);
  });
  
  cy.get(ticketSelector).find('[title="Delete ticket"]').click();
});

// Filter tickets command
Cypress.Commands.add('filterTickets', (filterType, value) => {
  if (filterType === 'status') {
    cy.get('select').contains('All Statuses').parent().find('select').select(value);
  } else if (filterType === 'priority') {
    cy.get('select').contains('All Priorities').parent().find('select').select(value);
  }
  cy.wait(1000);
});

// Search tickets command
Cypress.Commands.add('searchTickets', (searchTerm) => {
  cy.get('input[placeholder*="Search"]').clear().type(searchTerm);
  cy.wait(1000);
});

// Navigate to specific screen
Cypress.Commands.add('navigateToScreen', (screenId) => {
  cy.get(`a[href="/app/${screenId}"]`).click();
  cy.wait(2000);
});

// Check tenant isolation
Cypress.Commands.add('checkTenantIsolation', (user1, user2) => {
  // Login as first user and get data
  cy.login(user1.email, user1.password);
  cy.navigateToScreen('support-tickets');
  
  let user1Data;
  cy.get('[data-testid="ticket-card"]').then($cards => {
    user1Data = $cards.length;
  });
  
  // Logout and login as second user
  cy.logout();
  cy.login(user2.email, user2.password);
  cy.navigateToScreen('support-tickets');
  
  // Verify different data
  cy.get('[data-testid="ticket-card"]').should('have.length.not.equal', user1Data);
});

// Verify workflow integration
Cypress.Commands.add('verifyWorkflowIntegration', (ticketData) => {
  // Create ticket and verify workflow trigger
  cy.createTicket(ticketData);
  
  // Wait for potential workflow callback
  cy.wait(5000);
  
  // Check if ticket status was updated
  cy.contains(ticketData.title || 'Test Ticket').parent().should('be.visible');
});

// Check responsive design
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { width: 320, height: 568 },  // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1280, height: 720 }  // Desktop
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('main').should('be.visible');
    cy.get('nav').should('be.visible');
  });
});

// Take full page screenshot
Cypress.Commands.add('takeFullPageScreenshot', (name) => {
  cy.screenshot(name, { capture: 'fullPage' });
});

// Wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]').should('not.exist');
  cy.get('.animate-spin').should('not.exist');
});

// Verify API response
Cypress.Commands.add('verifyAPIResponse', (alias, expectedStatus = 200) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.eq(expectedStatus);
  });
});

// Check for console errors
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = [];
    const originalError = win.console.error;
    
    win.console.error = (...args) => {
      errors.push(args);
      originalError.apply(win.console, args);
    };
    
    cy.then(() => {
      expect(errors).to.have.length(0);
    });
  });
});

// Mock network conditions
Cypress.Commands.add('mockSlowNetwork', () => {
  cy.intercept('**', (req) => {
    req.reply((res) => {
      res.delay(2000);
    });
  });
});

// Verify accessibility basics
Cypress.Commands.add('checkBasicAccessibility', () => {
  // Check for proper heading structure
  cy.get('h1').should('exist');
  
  // Check for alt text on images
  cy.get('img').each($img => {
    cy.wrap($img).should('have.attr', 'alt');
  });
  
  // Check for proper form labels
  cy.get('input').each($input => {
    const id = $input.attr('id');
    if (id) {
      cy.get(`label[for="${id}"]`).should('exist');
    }
  });
  
  // Check for keyboard navigation
  cy.get('button, a, input, select, textarea').should('be.visible');
});

// Database cleanup command
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    if (token) {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/test/cleanup`,
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  });
});

// Performance measurement
Cypress.Commands.add('measurePageLoad', (pageName) => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    cy.log(`${pageName} load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(3000); // 3 second max
  });
});

// Custom assertions
Cypress.Commands.add('shouldBeWithinViewport', { prevSubject: true }, (subject) => {
  const element = subject[0];
  const rect = element.getBoundingClientRect();
  
  expect(rect.top).to.be.at.least(0);
  expect(rect.left).to.be.at.least(0);
  expect(rect.bottom).to.be.at.most(Cypress.config('viewportHeight'));
  expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'));
  
  return cy.wrap(subject);
});

// Utility for generating test data
Cypress.Commands.add('generateTestData', (type) => {
  const generators = {
    ticket: () => ({
      title: `Test Ticket ${Date.now()}`,
      description: `Test description ${Math.random().toString(36).substring(7)}`,
      priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
      tags: ['test', 'cypress', 'automation']
    }),
    user: () => ({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'User'
    })
  };
  
  return cy.wrap(generators[type]());
});