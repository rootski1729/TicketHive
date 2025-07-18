// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('flowbit');

// Create indexes for better performance
db.users.createIndex({ "email": 1, "customerId": 1 }, { unique: true });
db.users.createIndex({ "customerId": 1 });

db.tickets.createIndex({ "customerId": 1, "status": 1 });
db.tickets.createIndex({ "customerId": 1, "createdBy": 1 });
db.tickets.createIndex({ "customerId": 1, "createdAt": -1 });

db.auditlogs.createIndex({ "customerId": 1, "timestamp": -1 });
db.auditlogs.createIndex({ "userId": 1, "timestamp": -1 });
db.auditlogs.createIndex({ "action": 1, "timestamp": -1 });

print('MongoDB indexes created successfully');

// Create a default admin user (will be overwritten by seed script)
db.users.insertOne({
  email: 'admin@flowbit.com',
  password: '$2b$10$K8p7.yXw4RhQoIUvKmJOQeWuKaHLo5VzXqhL2VjKZaXLOdKdZqhkG', // hashed 'password123'
  role: 'Admin',
  customerId: 'flowbit',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Default admin user created');
print('Database initialization completed!');