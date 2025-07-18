const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Demo users database
const demoUsers = {
  'admin@logisticsco.com': {
    password: 'password123',
    role: 'Admin',
    customerId: 'LogisticsCo',
    email: 'admin@logisticsco.com'
  },
  'user@logisticsco.com': {
    password: 'password123',
    role: 'User',
    customerId: 'LogisticsCo',
    email: 'user@logisticsco.com'
  },
  'admin@retailgmbh.com': {
    password: 'password123',
    role: 'Admin',
    customerId: 'RetailGmbH',
    email: 'admin@retailgmbh.com'
  },
  'user@retailgmbh.com': {
    password: 'password123',
    role: 'User',
    customerId: 'RetailGmbH',
    email: 'user@retailgmbh.com'
  }
};

// Demo tickets database
const demoTickets = {
  LogisticsCo: [
    {
      _id: 'lc1',
      title: 'Shipment Delay Issue',
      description: 'Customer shipment delayed due to weather conditions',
      status: 'Open',
      priority: 'High',
      customerId: 'LogisticsCo',
      createdAt: new Date(),
      createdBy: { email: 'admin@logisticsco.com' },
      tags: ['shipment', 'delay', 'weather']
    },
    {
      _id: 'lc2',
      title: 'Route Optimization Request',
      description: 'Need to optimize delivery routes for better efficiency',
      status: 'In Progress',
      priority: 'Medium',
      customerId: 'LogisticsCo',
      createdAt: new Date(),
      createdBy: { email: 'user@logisticsco.com' },
      tags: ['route', 'optimization']
    }
  ],
  RetailGmbH: [
    {
      _id: 'rg1',
      title: 'Inventory Management Issue',
      description: 'Stock levels not updating correctly in the system',
      status: 'Open',
      priority: 'Critical',
      customerId: 'RetailGmbH',
      createdAt: new Date(),
      createdBy: { email: 'admin@retailgmbh.com' },
      tags: ['inventory', 'stock', 'system']
    },
    {
      _id: 'rg2',
      title: 'Customer Refund Process',
      description: 'Need to process refund for damaged goods',
      status: 'Resolved',
      priority: 'Low',
      customerId: 'RetailGmbH',
      createdAt: new Date(),
      createdBy: { email: 'user@retailgmbh.com' },
      tags: ['refund', 'customer', 'damaged']
    }
  ]
};

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = demoUsers[email.toLowerCase()];
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.password !== password) {
      console.log('Wrong password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate simple token
    const token = `token-${user.customerId}-${Date.now()}`;
    
    console.log('Login successful for:', email);
    res.json({ 
      token,
      user: {
        email: user.email,
        role: user.role,
        customerId: user.customerId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user info
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Extract customer ID from token
  const customerId = token.includes('LogisticsCo') ? 'LogisticsCo' : 'RetailGmbH';
  const email = token.includes('LogisticsCo') ? 'admin@logisticsco.com' : 'admin@retailgmbh.com';
  
  res.json({
    user: {
      email,
      role: 'Admin',
      customerId
    }
  });
});

// Get tenant screens
app.get('/me/screens', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  const customerId = token && token.includes('LogisticsCo') ? 'LogisticsCo' : 'RetailGmbH';
  
  const registry = {
    tenants: {
      LogisticsCo: [
        {
          id: 'support-tickets',
          name: 'Support Tickets',
          url: 'http://localhost:3002/remoteEntry.js',
          scope: 'supportTicketsApp',
          module: './SupportTicketsApp',
          icon: 'ticket'
        }
      ],
      RetailGmbH: [
        {
          id: 'support-tickets',
          name: 'Support Tickets',
          url: 'http://localhost:3002/remoteEntry.js',
          scope: 'supportTicketsApp',
          module: './SupportTicketsApp',
          icon: 'ticket'
        }
      ]
    }
  };
  
  res.json({ screens: registry.tenants[customerId] || [] });
});

// Get tickets with tenant isolation
app.get('/api/tickets', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const customerId = token.includes('LogisticsCo') ? 'LogisticsCo' : 'RetailGmbH';
  const tickets = demoTickets[customerId] || [];
  
  console.log(`Returning ${tickets.length} tickets for ${customerId}`);
  res.json({ tickets });
});

// Create ticket
app.post('/api/tickets', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const customerId = token.includes('LogisticsCo') ? 'LogisticsCo' : 'RetailGmbH';
  
  const ticket = {
    _id: `${customerId.toLowerCase()}-${Date.now()}`,
    ...req.body,
    status: 'Open',
    customerId,
    createdAt: new Date(),
    createdBy: { email: `admin@${customerId.toLowerCase()}.com` }
  };
  
  if (!demoTickets[customerId]) {
    demoTickets[customerId] = [];
  }
  
  demoTickets[customerId].push(ticket);
  
  console.log(`Created ticket for ${customerId}:`, ticket.title);
  res.status(201).json(ticket);
});

// Update ticket
app.put('/api/tickets/:id', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const customerId = token.includes('LogisticsCo') ? 'LogisticsCo' : 'RetailGmbH';
  const ticketId = req.params.id;
  
  const tickets = demoTickets[customerId] || [];
  const ticketIndex = tickets.findIndex(t => t._id === ticketId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets[ticketIndex] = { ...tickets[ticketIndex], ...req.body };
  
  console.log(`Updated ticket ${ticketId} for ${customerId}`);
  res.json(tickets[ticketIndex]);
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const customerId = token.includes('LogisticsCo') ? 'LogisticsCo' : 'RetailGmbH';
  const ticketId = req.params.id;
  
  const tickets = demoTickets[customerId] || [];
  const ticketIndex = tickets.findIndex(t => t._id === ticketId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  tickets.splice(ticketIndex, 1);
  
  console.log(`Deleted ticket ${ticketId} for ${customerId}`);
  res.json({ message: 'Ticket deleted' });
});

// Webhook endpoint for n8n
app.post('/webhook/ticket-done', (req, res) => {
  console.log('Webhook received:', req.body);
  res.json({ success: true, message: 'Webhook processed' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// MongoDB connection (optional for demo)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ API Server running on port ${PORT}`);
  console.log(`✅ Demo users ready:`);
  Object.keys(demoUsers).forEach(email => {
    console.log(`   - ${email} (${demoUsers[email].role}, ${demoUsers[email].customerId})`);
  });
});

module.exports = app;