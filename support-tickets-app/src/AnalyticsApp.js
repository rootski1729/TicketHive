import React from 'react';
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react';

const AnalyticsApp = () => {
  return (
    <div className="analytics-app p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Detailed insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume Trends */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ticket Volume Trends</h3>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium">342 tickets</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="text-green-600">+12%</span> from last month
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <PieChart className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            {[
              { category: 'Technical Issues', count: 45, color: 'bg-blue-500' },
              { category: 'Account Management', count: 32, color: 'bg-green-500' },
              { category: 'Billing', count: 28, color: 'bg-yellow-500' },
              { category: 'General Inquiry', count: 18, color: 'bg-purple-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.category}</span>
                </div>
                <span className="text-sm font-medium">{item.count}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Analytics */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Response Time Analytics</h3>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">1.2h</div>
                <div className="text-sm text-gray-600">Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0.8h</div>
                <div className="text-sm text-gray-600">Median</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">4.5h</div>
                <div className="text-sm text-gray-600">90th %ile</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              <span className="text-green-600">-15%</span> improvement from last month
            </div>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Satisfaction</h3>
            <Activity className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">4.2/5</div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${rating === 5 ? 45 : rating === 4 ? 35 : rating === 3 ? 15 : rating === 2 ? 3 : 2}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {rating === 5 ? 45 : rating === 4 ? 35 : rating === 3 ? 15 : rating === 2 ? 3 : 2}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div className="mt-8 bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { metric: 'First Response Time', current: '2.3 hours', target: '2.0 hours', change: '+5%', changeType: 'negative' },
                { metric: 'Resolution Time', current: '18.5 hours', target: '24.0 hours', change: '-12%', changeType: 'positive' },
                { metric: 'Customer Satisfaction', current: '4.2/5', target: '4.0/5', change: '+8%', changeType: 'positive' },
                { metric: 'Ticket Volume', current: '342', target: '350', change: '+12%', changeType: 'neutral' },
                { metric: 'Escalation Rate', current: '8.5%', target: '10.0%', change: '-3%', changeType: 'positive' }
              ].map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.metric}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.current}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${
                      row.changeType === 'positive' ? 'text-green-600' :
                      row.changeType === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {row.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsApp;