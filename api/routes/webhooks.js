const express = require('express');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify webhook secret
const verifyWebhookSecret = (req, res, next) => {
  const secret = req.headers['x-flowbit-secret'];
  
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }
  
  next();
};

// n8n webhook callback for ticket processing completion
router.post('/ticket-done', verifyWebhookSecret, async (req, res) => {
  try {
    const { ticketId, customerId, status, workflowId, processingResult } = req.body;
    
    if (!ticketId || !customerId) {
      return res.status(400).json({ error: 'ticketId and customerId are required' });
    }

    // Find the ticket
    const ticket = await Ticket.findOne({
      _id: ticketId,
      customerId: customerId
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket status and metadata
    const oldStatus = ticket.status;
    ticket.status = status || 'In Progress';
    ticket.workflowId = workflowId;
    ticket.metadata = {
      ...ticket.metadata,
      workflowProcessed: true,
      processingResult: processingResult || 'Workflow completed',
      processedAt: new Date()
    };

    await ticket.save();

    // Find a user from the same tenant for audit logging
    const user = await User.findOne({ customerId: customerId });
    
    if (user) {
      // Log the workflow completion
      await AuditLog.logAction({
        action: 'WORKFLOW_COMPLETE',
        userId: user._id,
        customerId: customerId,
        resourceType: 'Ticket',
        resourceId: ticket._id,
        details: {
          workflowId,
          oldStatus,
          newStatus: ticket.status,
          processingResult,
          completedAt: new Date()
        },
        ipAddress: req.ip,
        userAgent: 'n8n-webhook'
      });
    }

    console.log(`Ticket ${ticketId} updated via webhook - Status: ${oldStatus} → ${ticket.status}`);

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: {
        id: ticket._id,
        status: ticket.status,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Generic webhook endpoint for other n8n workflows
router.post('/generic', verifyWebhookSecret, async (req, res) => {
  try {
    const { customerId, action, data } = req.body;
    
    console.log(`Generic webhook received for customer ${customerId}:`, { action, data });
    
    // Here you can add logic to handle different types of webhook events
    // For now, we'll just log it
    
    res.json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Generic webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Health check for webhooks
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'webhook-service',
    timestamp: new Date()
  });
});

module.exports = router;