const express = require('express');
const axios = require('axios');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { ensureTenantIsolation } = require('../middleware/auth');

const router = express.Router();

// Apply tenant isolation to all routes
router.use(ensureTenantIsolation);

// Get all tickets for the current tenant
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    
    const filter = { customerId: req.user.customerId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      customerId: req.user.customerId
    })
    .populate('createdBy', 'email')
    .populate('assignedTo', 'email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create new ticket and trigger n8n workflow
router.post('/', async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      customerId: req.user.customerId,
      createdBy: req.user.userId
    };

    const ticket = new Ticket(ticketData);
    await ticket.save();

    // Log the creation
    await AuditLog.logAction({
      action: 'CREATE_TICKET',
      userId: req.user.userId,
      customerId: req.user.customerId,
      resourceType: 'Ticket',
      resourceId: ticket._id,
      details: {
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Trigger n8n workflow
    try {
      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL || 'http://n8n:5678/webhook/flowbit-trigger',
        {
          ticketId: ticket._id.toString(),
          customerId: req.user.customerId,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          createdBy: req.user.email,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Flowbit-Secret': process.env.WEBHOOK_SECRET
          },
          timeout: 5000
        }
      );

      console.log('n8n workflow triggered:', n8nResponse.data);
      
      // Update ticket with workflow ID if available
      if (n8nResponse.data && n8nResponse.data.workflowId) {
        ticket.workflowId = n8nResponse.data.workflowId;
        await ticket.save();
      }

      // Log workflow trigger
      await AuditLog.logAction({
        action: 'WORKFLOW_TRIGGER',
        userId: req.user.userId,
        customerId: req.user.customerId,
        resourceType: 'Ticket',
        resourceId: ticket._id,
        details: {
          workflowId: n8nResponse.data?.workflowId,
          n8nResponse: n8nResponse.data
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

    } catch (n8nError) {
      console.error('n8n workflow trigger failed:', n8nError.message);
      // Don't fail the ticket creation if workflow fails
    }

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email');

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      customerId: req.user.customerId
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    const allowedFields = ['title', 'description', 'status', 'priority', 'assignedTo', 'tags'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        ticket[field] = req.body[field];
      }
    });

    await ticket.save();

    // Log the update
    await AuditLog.logAction({
      action: 'UPDATE_TICKET',
      userId: req.user.userId,
      customerId: req.user.customerId,
      resourceType: 'Ticket',
      resourceId: ticket._id,
      details: {
        oldStatus,
        newStatus: ticket.status,
        changes: req.body
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email');

    res.json(populatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      customerId: req.user.customerId
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await Ticket.findByIdAndDelete(ticket._id);

    // Log the deletion
    await AuditLog.logAction({
      action: 'DELETE_TICKET',
      userId: req.user.userId,
      customerId: req.user.customerId,
      resourceType: 'Ticket',
      resourceId: ticket._id,
      details: {
        title: ticket.title,
        status: ticket.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// Get ticket statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      { $match: { customerId: req.user.customerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTickets = await Ticket.countDocuments({ customerId: req.user.customerId });
    
    res.json({
      totalTickets,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;