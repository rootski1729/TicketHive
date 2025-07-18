const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  workflowId: {
    type: String 
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

ticketSchema.index({ customerId: 1, status: 1 });
ticketSchema.index({ customerId: 1, createdBy: 1 });
ticketSchema.index({ customerId: 1, createdAt: -1 });

ticketSchema.pre(/^find/, function(next) {
  if (!this.getQuery().customerId) {
    return next(new Error('customerId is required for tenant isolation'));
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);