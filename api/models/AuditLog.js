const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_TICKET',
      'UPDATE_TICKET',
      'DELETE_TICKET',
      'LOGIN',
      'LOGOUT',
      'WORKFLOW_TRIGGER',
      'WORKFLOW_COMPLETE'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    enum: ['Ticket', 'User', 'Workflow'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false 
});


auditLogSchema.index({ customerId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const logEntry = new this(actionData);
    await logEntry.save();
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);