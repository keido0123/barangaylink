import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="text-gray-400">Loading dashboard...</div></div></AdminLayout>;

  const docStatusData = Object.entries(stats.document_status || {}).map(([name, value]) => ({ name, value }));
  const incidentData = Object.entries(stats.incident_categories || {}).map(([name, value]) => ({ name, value }));
  const clusterData = Object.entries(stats.income_clusters || {}).map(([name, value]) => ({ name, value }));
  const docTypeData = Object.entries(stats.document_types || {}).map(([name, value]) => ({ name, value }));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = months.map((name, i) => ({ name, requests: stats.monthly_requests?.[i+1] || 0 }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Registered Users', value: stats.total_users, icon: '👥', color: 'bg-blue-500' },
            { label: 'Total Residents', value: stats.total_residents, icon: '🏠', color: 'bg-green-500' },
            { label: 'Doc Requests', value: stats.total_document_requests, icon: '📄', color: 'bg-purple-500' },
            { label: 'Pending Docs', value: stats.pending_requests, icon: '⏳', color: 'bg-yellow-500' },
            { label: 'Incidents', value: stats.total_incidents, icon: '🚨', color: 'bg-red-500' },
            { label: 'Open Incidents', value: stats.pending_incidents, icon: '⚠️', color: 'bg-orange-500' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-lg mb-3`}>{card.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">Monthly Document Requests (2026)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="requests" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">Document Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={docStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {docStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">📊 Population Clusters</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={clusterData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name}) => name}>
                  <Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {clusterData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: ['#10b981','#f59e0b','#8b5cf6'][i] }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">Incident Categories</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incidentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">Document Types Requested</h3>
            <div className="space-y-3">
              {docTypeData.map((item, i) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 text-xs">{item.name}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 rounded-full" style={{ width: `${(item.value / (stats.total_document_requests || 1)) * 100}%`, background: COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}