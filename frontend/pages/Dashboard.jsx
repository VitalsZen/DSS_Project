// frontend/pages/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
// Import Context
import { useApplicationContext } from "../context/ApplicationContext";
import { useJdContext } from "../context/JdContext";
import { AnalysisResultView } from "../components/AnalysisResultView";

export const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- FIX LỖI Ở ĐÂY: Lấy 'applications' từ Context ---
  const { applications, t } = useApplicationContext();
  const { jds } = useJdContext();
  const [selectedApp, setSelectedApp] = useState(null);

  // Đảm bảo applications luôn là mảng (tránh lỗi null/undefined)
  const appList = applications || [];

  // --- 1. Metrics Calculation ---
  const totalApplications = appList.length;
  const totalAnalyses = appList.length; 
  const savedJdsCount = jds.length;
  const perfectMatchesCount = appList.filter(app => app.matchScore > 90).length;

  // --- 2. Chart Data Logic ---
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const mapCount = {};

    const parseVNDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            // Bỏ phần giờ phút nếu có (ví dụ: "29/11/2025, 22:09")
            const datePart = dateStr.split(',')[0].trim();
            // Tách theo dấu /
            const parts = datePart.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            }
            if (dateStr.includes('-')) return dateStr.split('T')[0];
        } catch (e) {
            return null;
        }
        return null;
    };

    appList.forEach(app => {
        const isoDate = parseVNDate(app.dateApplied); 
        if (isoDate) {
            mapCount[isoDate] = (mapCount[isoDate] || 0) + 1;
        }
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoKey = d.toISOString().split('T')[0]; 
      const displayKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      
      data.push({
        name: displayKey,
        value: mapCount[isoKey] || 0
      });
    }
    return data;
  }, [appList]);

  // --- 3. Recent Applications ---
  const recentApplications = appList.slice(0, 4);

  const getStatusColor = (status) => {
    switch (status) {
        case 'Applied': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
        case 'Interviewing': return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
        case 'Offer Received': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
        case 'Rejected': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Layout title={t('sidebar.dashboard')}>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
        {[
          { label: t('dashboard.analyses'), value: totalAnalyses, icon: "analytics", color: "text-primary", bg: "bg-primary/10" },
          { label: t('dashboard.applications'), value: totalApplications, icon: "folder_open", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
          { label: t('dashboard.saved_jds'), value: savedJdsCount, icon: "library_books", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
          { label: t('dashboard.perfect_matches'), value: perfectMatchesCount, icon: "verified", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
        ].map((metric, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl p-6 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full ${metric.bg} ${metric.color}`}>
               <Icon name={metric.icon} className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="tracking-tight text-3xl font-bold text-text-light dark:text-text-dark">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="flex w-full flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">{t('dashboard.activity')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.activity_sub')}</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#137fec" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} minTickGap={30} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#137fec', fontWeight: 'bold' }} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="value" name={t('dashboard.analyses')} stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-text-light dark:text-text-dark">{t('dashboard.recent')}</h2>
            <button onClick={() => navigate('/pipeline')} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1">
                {t('dashboard.view_all')} <Icon name="arrow_forward" className="text-sm" />
            </button>
        </div>
        
        <div className="w-full overflow-hidden rounded-xl border border-border-light dark:border-border-dark shadow-sm bg-card-light dark:bg-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.company')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.role')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.date')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.status')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {recentApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-text-light dark:text-text-dark text-center">
                        {app.companyName && app.companyName !== "Unknown Company" ? app.companyName : "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium text-center">
                        {app.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm text-center">
                      {app.dateApplied}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border border-transparent ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${getScoreColor(app.matchScore)}`}>{app.matchScore}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${app.matchScore >= 90 ? 'bg-green-500' : app.matchScore >= 75 ? 'bg-blue-500' : app.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    style={{ width: `${app.matchScore}%` }}
                                />
                            </div>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentApplications.length === 0 && (
             <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">
                 {t('dashboard.no_apps')}
             </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-background-light dark:bg-background-dark w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white dark:bg-card-dark shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                                {selectedApp.jobTitle.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                                    {selectedApp.jobTitle}
                                </h2>
                                {selectedApp.companyName && selectedApp.companyName !== "Unknown Company" && (
                                    <p className="text-xs text-slate-500">{selectedApp.companyName}</p>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <Icon name="close" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                         <AnalysisResultView 
                            data={typeof selectedApp.analysisResult === 'string' ? JSON.parse(selectedApp.analysisResult) : selectedApp.analysisResult}
                            customTitle={selectedApp.jobTitle}
                            customSubtitle={`Analysis saved on ${selectedApp.dateApplied}`}
                         />
                    </div>
                </div>
            </div>
      )}
    </Layout>
  );
};