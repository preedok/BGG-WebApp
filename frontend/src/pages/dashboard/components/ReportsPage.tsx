import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, Package, FileText } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('thisMonth');

  const reportTypes = [
    {
      title: 'Revenue Report',
      description: 'Comprehensive revenue analysis by period',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      metrics: { thisMonth: 'Rp 2.4B', lastMonth: 'Rp 2.1B', growth: '+14.3%' }
    },
    {
      title: 'Orders Report',
      description: 'Order statistics and trends',
      icon: <Package className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      metrics: { thisMonth: '342', lastMonth: '298', growth: '+14.8%' }
    },
    {
      title: 'Partners Report',
      description: 'Partner activity and performance',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      metrics: { active: '45', new: '8', growth: '+21.6%' }
    },
    {
      title: 'Jamaah Report',
      description: 'Pilgrim statistics and demographics',
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      metrics: { thisMonth: '1,245', lastMonth: '1,089', growth: '+14.3%' }
    }
  ];

  const quickReports = [
    { name: 'Daily Sales Summary', icon: <FileText className="w-5 h-5" />, format: 'PDF' },
    { name: 'Weekly Performance', icon: <BarChart3 className="w-5 h-5" />, format: 'Excel' },
    { name: 'Monthly Financial Report', icon: <DollarSign className="w-5 h-5" />, format: 'PDF' },
    { name: 'Partner Activity Log', icon: <Users className="w-5 h-5" />, format: 'Excel' },
    { name: 'Inventory Status', icon: <Package className="w-5 h-5" />, format: 'Excel' },
    { name: 'Payment Reconciliation', icon: <FileText className="w-5 h-5" />, format: 'PDF' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">Generate comprehensive business reports and insights</p>
      </div>

      <div className="flex gap-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="today">Today</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisQuarter">This Quarter</option>
          <option value="thisYear">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        <Button variant="primary">
          <Calendar className="w-5 h-5 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color} text-white`}>
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{report.title}</h3>
                    <p className="text-sm text-slate-600">{report.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">This Month</p>
                  <p className="text-lg font-bold text-slate-900">{report.metrics.thisMonth}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Last Month</p>
                  <p className="text-lg font-bold text-slate-900">{report.metrics.lastMonth}</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700 mb-1">Growth</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <p className="text-lg font-bold text-emerald-600">{report.metrics.growth}</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Detailed Report
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickReports.map((report, index) => (
            <div
              key={index}
              className="p-4 border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    {report.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{report.name}</p>
                    <p className="text-xs text-slate-500">{report.format} format</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Custom Report Builder</h3>
          <p className="text-slate-600">Build custom reports with specific metrics and filters</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Metrics</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option>Revenue</option>
                <option>Orders</option>
                <option>Jamaah</option>
                <option>Partners</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Group By</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Export Format</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </div>

          <Button variant="primary" className="w-full">
            <BarChart3 className="w-5 h-5 mr-2" />
            Generate Custom Report
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;