import React, { useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { useApplicationContext } from "../context/ApplicationContext";
import { useJdContext } from "../context/JdContext";
import { AnalysisResultView } from "../components/AnalysisResultView";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { applications, t, language } = useApplicationContext();
  const { jds } = useJdContext();
  const [selectedApp, setSelectedApp] = useState(null);

  const appList = applications || [];

  // Metrics Calculation 
  const totalApplications = appList.length;
  const totalAnalyses = appList.length; 
  const savedJdsCount = jds.length;
  const perfectMatchesCount = appList.filter(app => app.matchScore >= 90).length;

  // Chart Data Logic
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const mapCount = {};

    appList.forEach(app => {
        if (!app.createdAt) return;
        let dateObj = new Date(app.createdAt);
        if (typeof app.createdAt === 'string' && !app.createdAt.endsWith('Z')) {
            dateObj = new Date(app.createdAt + 'Z');
        }
        const localDateKey = dateObj.toLocaleDateString('en-CA'); 
        mapCount[localDateKey] = (mapCount[localDateKey] || 0) + 1;
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const lookupKey = d.toLocaleDateString('en-CA');
      const locale = language === 'vi' ? 'vi-VN' : 'en-GB';
      const displayLabel = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
      
      data.push({
        name: displayLabel,
        value: mapCount[lookupKey] || 0
      });
    }
    return data;
  }, [appList, language]);

  // --- 3. Recent Applications ---
  const recentApplications = appList.slice(0, 5);

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes('offer')) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes('interview')) return "bg-purple-100 text-purple-700 border-purple-200";
    if (s.includes('reject')) return "bg-red-100 text-red-700 border-red-200";
    if (s.includes('wishlist')) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-blue-100 text-blue-700 border-blue-200"; 
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getParseResult = (app) => {
      if (!app.analysisResult) return null;
      return typeof app.analysisResult === 'string' 
        ? JSON.parse(app.analysisResult) 
        : app.analysisResult;
  };

  return (
    <Layout title={t('sidebar.dashboard')}>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {[
          { label: t('dashboard.analyses'), value: totalAnalyses, icon: "analytics", color: "text-primary", bg: "bg-blue-50 border-blue-100" },
          { label: t('dashboard.applications'), value: totalApplications, icon: "folder_open", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
          { label: t('dashboard.saved_jds'), value: savedJdsCount, icon: "library_books", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
          { label: t('dashboard.perfect_matches'), value: perfectMatchesCount, icon: "verified", color: "text-green-600", bg: "bg-green-50 border-green-100" },
        ].map((metric, i) => (
          <div key={i} className={`flex items-center gap-4 rounded-xl p-6 border ${metric.bg} bg-white dark:bg-card-dark shadow-sm`}>
            <div className={`p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm ${metric.color}`}>
               <Icon name={metric.icon} className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="tracking-tight text-3xl font-black text-slate-800 dark:text-white">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="flex w-full flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('dashboard.activity')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.activity_sub')}</p>
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
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                minTickGap={30} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                allowDecimals={false} 
              />
              
              {/* Việt hóa Tooltip */}
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
                formatter={(value) => [value, language === 'vi' ? 'Số lượng' : 'Count']}
              />
              
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#137fec" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1500} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">{t('dashboard.recent')}</h2>
            <button onClick={() => navigate('/pipeline')} className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
                {t('dashboard.view_all')} <Icon name="arrow_forward" className="text-sm" />
            </button>
        </div>
        
        <div className="w-full overflow-hidden rounded-xl border border-border-light dark:border-border-dark shadow-sm bg-white dark:bg-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('dashboard.table.company')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('dashboard.table.role')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.status')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-center">{t('dashboard.table.score')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-right">{t('dashboard.table.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {recentApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="size-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                {(app.companyName || "U").substring(0,2)}
                            </div>
                            {app.companyName || "Unknown"}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {app.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                        {t(`status.${app.status}`) || app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${app.matchScore >= 90 ? 'bg-green-500' : app.matchScore >= 70 ? 'bg-blue-500' : app.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    style={{ width: `${app.matchScore}%` }}
                                />
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(app.matchScore)}`}>{app.matchScore}%</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400 text-sm">
                      {app.dateApplied}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentApplications.length === 0 && (
             <div className="p-12 text-center flex flex-col items-center justify-center">
                 <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                    <Icon name="search_off" className="text-2xl" />
                 </div>
                 <p className="text-slate-500 dark:text-slate-400 italic">{t('dashboard.no_apps')}</p>
             </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-background-light dark:bg-background-dark w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white dark:bg-card-dark shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                                {selectedApp.jobTitle.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                                    {selectedApp.jobTitle}
                                </h2>
                                {selectedApp.companyName && (
                                    <p className="text-xs text-slate-500">{selectedApp.companyName}</p>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <Icon name="close" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-background-dark">
                         <AnalysisResultView 
                            data={getParseResult(selectedApp)}
                            customTitle={selectedApp.jobTitle}
                            customSubtitle={`${t('dashboard.table.date')}: ${selectedApp.dateApplied}`}
                         />
                    </div>
                </div>
            </div>
      )}
    </Layout>
  );
};
