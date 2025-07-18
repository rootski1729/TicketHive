const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowbit';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing data');

    // Create LogisticsCo users
    const logisticsAdmin = new User({
      email: 'admin@logisticsco.com',
      password: 'password123',
      role: 'Admin',
      customerId: 'LogisticsCo'
    });
    await logisticsAdmin.save();

    const logisticsUser = new User({
      email: 'user@logisticsco.com',
      password: 'password123',
      role: 'User',
      customerId: 'LogisticsCo'
    });
    await logisticsUser.save();

    // Create RetailGmbH users
    const retailAdmin = new User({
      email: 'admin@retailgmbh.com',
      password: 'password123',
      role: 'Admin',
      customerId: 'RetailGmbH'
    });
    await retailAdmin.save();

    const retailUser = new User({
      email: 'user@retailgmbh.com',
      password: 'password123',
      role: 'User',
      customerId: 'RetailGmbH'
    });
    await retailUser.save();

    console.log('Created users:');
    console.log('- LogisticsCo Admin: admin@logisticsco.com / password123');
    console.log('- LogisticsCo User: user@logisticsco.com / password123');
    console.log('- RetailGmbH Admin: admin@retailgmbh.com / password123');
    console.log('- RetailGmbH User: user@retailgmbh.com / password123');

    // Create sample tickets for LogisticsCo
    const logisticsTickets = [
      {
        title: 'Shipment Tracking Issue',
        description: 'Customer cannot track their shipment using the tracking number provided.',
        status: 'Open',
        priority: 'High',
        customerId: 'LogisticsCo',
        createdBy: logisticsUser._id,
        tags: ['tracking', 'shipment']
      },
      {
        title: 'Delivery Delay Complaint',
        description: 'Package was supposed to arrive yesterday but still not delivered.',
        status: 'In Progress',
        priority: 'Medium',
        customerId: 'LogisticsCo',
        createdBy: logisticsUser._id,
        assignedTo: logisticsAdmin._id,
        tags: ['delivery', 'delay']
      },
      {
        title: 'Damaged Package Report',
        description: 'Customer received a damaged package and wants replacement.',
        status: 'Resolved',
        priority: 'Low',
        customerId: 'LogisticsCo',
        createdBy: logisticsAdmin._id,
        tags: ['damage', 'replacement']
      }
    ];

    // Create sample tickets for RetailGmbH
    const retailTickets = [
      {
        title: 'Product Return Request',
        description: 'Customer wants to return a defective product purchased last week.',
        status: 'Open',
        priority: 'Medium',
        customerId: 'RetailGmbH',
        createdBy: retailUser._id,
        tags: ['return', 'defective']
      },
      {
        title: 'Payment Processing Error',
        description: 'Customer was charged twice for the same order.',
        status: 'In Progress',
        priority: 'High',
        customerId: 'RetailGmbH',
        createdBy: retailUser._id,
        assignedTo: retailAdmin._id,
        tags: ['payment', 'billing']
      },
      {
        title: 'Website Login Issue',
        description: 'Customer cannot log into their account on the website.',
        status: 'Open',
        priority: 'Low',
        customerId: 'RetailGmbH',
        createdBy: retailAdmin._id,
        tags: ['login', 'website']
      },
      {
        title: 'Bulk Order Inquiry',
        description: 'Business customer asking about bulk pricing for 1000+ units.',
        status: 'Resolved',
        priority: 'Medium',
        customerId: 'RetailGmbH',
        createdBy: retailAdmin._id,
        tags: ['bulk', 'pricing', 'business']
      }
    ];

    // Insert tickets
    await Ticket.insertMany(logisticsTickets);
    await Ticket.insertMany(retailTickets);

    console.log(`Created ${logisticsTickets.length} tickets for LogisticsCo`);
    console.log(`Created ${retailTickets.length} tickets for RetailGmbH`);

    console.log('\nDatabase seeded successfully!');
    console.log('\nYou can now test the application with the following credentials:');
    console.log('\nLogisticsCo Tenant:');
    console.log('  Admin: admin@logisticsco.com / password123');
    console.log('  User:  user@logisticsco.com / password123');
    console.log('\nRetailGmbH Tenant:');
    console.log('  Admin: admin@retailgmbh.com / password123');
    console.log('  User:  user@retailgmbh.com / password123');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedDatabase();