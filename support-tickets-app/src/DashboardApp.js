import React from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

const DashboardApp = () => {
  return (
    <div className="dashboard-app p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your operations and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">2.3 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Resolution Rate</span>
              <span className="text-sm font-medium">87%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-medium">4.2/5</span>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Tickets Today</span>
              <span className="text-sm font-medium">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Resolved Today</span>
              <span className="text-sm font-medium">18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Tickets</span>
              <span className="text-sm font-medium">42</span>
            </div>
          </div>
        </div>

        {/* Team Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team</h3>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Online Agents</span>
              <span className="text-sm font-medium">8/12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Load</span>
              <span className="text-sm font-medium">5.2 tickets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">1.8 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y">
          {[
            { action: 'Ticket #1234 resolved', time: '2 minutes ago', type: 'success' },
            { action: 'New ticket created by john@example.com', time: '5 minutes ago', type: 'info' },
            { action: 'Ticket #1230 escalated to high priority', time: '15 minutes ago', type: 'warning' },
            { action: 'Customer feedback received (4.5/5)', time: '1 hour ago', type: 'success' }
          ].map((item, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'success' ? 'bg-green-500' :
                  item.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <span className="text-sm text-gray-900">{item.action}</span>
              </div>
              <span className="text-sm text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;