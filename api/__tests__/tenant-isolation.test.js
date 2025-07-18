const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

describe('Tenant Isolation', () => {
  let tenantAAdmin, tenantBAdmin;
  let tenantAToken, tenantBToken;
  let tenantATicket, tenantBTicket;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/flowbit_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create Tenant A Admin
    tenantAAdmin = new User({
      email: 'admin@logisticsco.com',
      password: 'password123',
      role: 'Admin',
      customerId: 'LogisticsCo'
    });
    await tenantAAdmin.save();

    // Create Tenant B Admin
    tenantBAdmin = new User({
      email: 'admin@retailgmbh.com',
      password: 'password123',
      role: 'Admin',
      customerId: 'RetailGmbH'
    });
    await tenantBAdmin.save();

    // Login as Tenant A Admin
    const tenantALogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@logisticsco.com',
        password: 'password123'
      });
    tenantAToken = tenantALogin.body.token;

    // Login as Tenant B Admin
    const tenantBLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@retailgmbh.com',
        password: 'password123'
      });
    tenantBToken = tenantBLogin.body.token;

    // Create a ticket for Tenant A
    tenantATicket = new Ticket({
      title: 'Tenant A Ticket',
      description: 'This is a ticket for Tenant A',
      status: 'Open',
      priority: 'Medium',
      customerId: 'LogisticsCo',
      createdBy: tenantAAdmin._id
    });
    await tenantATicket.save();

    // Create a ticket for Tenant B
    tenantBTicket = new Ticket({
      title: 'Tenant B Ticket',
      description: 'This is a ticket for Tenant B',
      status: 'Open',
      priority: 'High',
      customerId: 'RetailGmbH',
      createdBy: tenantBAdmin._id
    });
    await tenantBTicket.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Ticket Access Control', () => {
    test('Tenant A Admin cannot access Tenant B tickets', async () => {
      // Try to get all tickets as Tenant A Admin
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(200);

      // Should only see Tenant A tickets
      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].title).toBe('Tenant A Ticket');
      expect(response.body.tickets[0].customerId).toBe('LogisticsCo');
    });

    test('Tenant B Admin cannot access Tenant A tickets', async () => {
      // Try to get all tickets as Tenant B Admin
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(200);

      // Should only see Tenant B tickets
      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].title).toBe('Tenant B Ticket');
      expect(response.body.tickets[0].customerId).toBe('RetailGmbH');
    });

    test('Tenant A Admin cannot access specific Tenant B ticket', async () => {
      // Try to get Tenant B ticket as Tenant A Admin
      const response = await request(app)
        .get(`/api/tickets/${tenantBTicket._id}`)
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(404);

      expect(response.body.error).toBe('Ticket not found');
    });

    test('Tenant B Admin cannot access specific Tenant A ticket', async () => {
      // Try to get Tenant A ticket as Tenant B Admin
      const response = await request(app)
        .get(`/api/tickets/${tenantATicket._id}`)
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(404);

      expect(response.body.error).toBe('Ticket not found');
    });

    test('Tenant A Admin cannot update Tenant B ticket', async () => {
      // Try to update Tenant B ticket as Tenant A Admin
      const response = await request(app)
        .put(`/api/tickets/${tenantBTicket._id}`)
        .set('Authorization', `Bearer ${tenantAToken}`)
        .send({
          status: 'Resolved'
        })
        .expect(404);

      expect(response.body.error).toBe('Ticket not found');
    });

    test('Tenant B Admin cannot delete Tenant A ticket', async () => {
      // Try to delete Tenant A ticket as Tenant B Admin
      const response = await request(app)
        .delete(`/api/tickets/${tenantATicket._id}`)
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(404);

      expect(response.body.error).toBe('Ticket not found');
    });
  });

  describe('User Access Control', () => {
    test('Tenant A Admin cannot access Tenant B users', async () => {
      // Try to get all users as Tenant A Admin
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(200);

      // Should only see Tenant A users
      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe('admin@logisticsco.com');
      expect(response.body[0].customerId).toBe('LogisticsCo');
    });

    test('Tenant B Admin cannot access Tenant A users', async () => {
      // Try to get all users as Tenant B Admin
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(200);

      // Should only see Tenant B users
      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe('admin@retailgmbh.com');
      expect(response.body[0].customerId).toBe('RetailGmbH');
    });

    test('Tenant A Admin cannot access specific Tenant B user', async () => {
      // Try to get Tenant B user as Tenant A Admin
      const response = await request(app)
        .get(`/api/users/${tenantBAdmin._id}`)
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Screen Registry Access', () => {
    test('Tenant A gets correct screens from registry', async () => {
      const response = await request(app)
        .get('/me/screens')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(200);

      expect(response.body.screens).toBeDefined();
      expect(response.body.screens.length).toBeGreaterThan(0);
      
      // Check that screens are tenant-specific
      const supportTicketScreen = response.body.screens.find(s => s.id === 'support-tickets');
      expect(supportTicketScreen).toBeDefined();
      expect(supportTicketScreen.name).toBe('Support Tickets');
    });

    test('Tenant B gets correct screens from registry', async () => {
      const response = await request(app)
        .get('/me/screens')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(200);

      expect(response.body.screens).toBeDefined();
      expect(response.body.screens.length).toBeGreaterThan(0);
      
      // Check that screens are tenant-specific
      const supportTicketScreen = response.body.screens.find(s => s.id === 'support-tickets');
      expect(supportTicketScreen).toBeDefined();
      expect(supportTicketScreen.name).toBe('Support Tickets');
    });
  });

  describe('Database Level Isolation', () => {
    test('Direct database query respects tenant isolation', async () => {
      // Direct database query should require customerId
      const tickets = await Ticket.find({ customerId: 'LogisticsCo' });
      expect(tickets).toHaveLength(1);
      expect(tickets[0].title).toBe('Tenant A Ticket');

      const otherTenantTickets = await Ticket.find({ customerId: 'RetailGmbH' });
      expect(otherTenantTickets).toHaveLength(1);
      expect(otherTenantTickets[0].title).toBe('Tenant B Ticket');
    });

    test('Attempting to query without customerId should fail', async () => {
      // This should throw an error due to our pre-find middleware
      await expect(Ticket.find({})).rejects.toThrow('customerId is required for tenant isolation');
    });
  });
});