import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, DollarSign, Bell, Shield, Database, Mail, Save } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'currency', label: 'Currency & Exchange', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'email', label: 'Email Settings', icon: <Mail className="w-5 h-5" /> },
    { id: 'system', label: 'System', icon: <Database className="w-5 h-5" /> }
  ];

  const exchangeRates = [
    { currency: 'SAR', rate: 4200, symbol: 'ر.س', lastUpdated: '2026-02-14 08:00' },
    { currency: 'USD', rate: 15500, symbol: '$', lastUpdated: '2026-02-14 08:00' },
    { currency: 'EUR', rate: 16800, symbol: '€', lastUpdated: '2026-02-14 08:00' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure system settings and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <h3 className="text-xl font-bold text-slate-900 mb-6">General Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    defaultValue="Bintang Global Group"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Address</label>
                  <textarea
                    defaultValue="Jl. Gatot Subroto No. 123, Jakarta Selatan, DKI Jakarta 12950"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="text"
                      defaultValue="+62 21 8094 5678"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="info@bintangglobal.com"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <Button variant="primary">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'currency' && (
            <Card>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Currency & Exchange Rates</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Base Currency</label>
                  <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option>IDR - Indonesian Rupiah</option>
                    <option>SAR - Saudi Riyal</option>
                    <option>USD - US Dollar</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Exchange Rates (to IDR)</h4>
                  <div className="space-y-4">
                    {exchangeRates.map((rate) => (
                      <div key={rate.currency} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                              {rate.symbol}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{rate.currency}</p>
                              <p className="text-xs text-slate-500">Last updated: {rate.lastUpdated}</p>
                            </div>
                          </div>
                          <Badge variant="info">Active</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-xs text-slate-600 mb-1">Rate</label>
                            <input
                              type="number"
                              defaultValue={rate.rate}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <Button variant="primary" size="sm">Update</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="primary">
                  <Save className="w-5 h-5 mr-2" />
                  Save All Rates
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', description: 'Receive email notifications for important events' },
                  { label: 'Order Notifications', description: 'Get notified when new orders are placed' },
                  { label: 'Payment Notifications', description: 'Receive alerts for payment confirmations' },
                  { label: 'Invoice Notifications', description: 'Get notified about invoice updates' },
                  { label: 'System Alerts', description: 'Receive system maintenance and update notifications' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Password Requirements</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                      <span className="text-slate-700">Minimum 8 characters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                      <span className="text-slate-700">Require uppercase letters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                      <span className="text-slate-700">Require numbers</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" />
                      <span className="text-slate-700">Require special characters</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Session Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <Button variant="primary">
                  <Save className="w-5 h-5 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;