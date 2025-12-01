import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";

const funnelData = [
  { name: "Applied", value: 1500, color: "#3b82f6", bg: "#dbeafe" },
  { name: "Screened", value: 900, color: "#10b981", bg: "#d1fae5" },
  { name: "Interview", value: 375, color: "#f97316", bg: "#ffedd5" },
  { name: "Hired", value: 75, color: "#8b5cf6", bg: "#ede9fe" },
];

const sourceData = [
  { name: "LinkedIn", value: 55, color: "#3b82f6" },
  { name: "Website", value: 30, color: "#10b981" },
  { name: "Referral", value: 15, color: "#f97316" },
];

export const Reports = () => {
  return (
    <Layout title="Analytics & Reporting">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-text-light">Recruitment Metrics</h2>
          <p className="text-slate-500">Key insights into your hiring performance.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-card-light border border-border-light rounded-lg hover:bg-slate-50 transition-colors">
            <Icon name="calendar_today" className="text-slate-500 text-lg" />
            <span className="font-medium text-sm">Last 30 Days</span>
            <Icon name="expand_more" className="text-slate-500 text-lg" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Icon name="download" className="text-lg" />
            <span className="font-medium text-sm">Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {[
          { title: "Total Hires", value: "42", change: "+12%", trend: "up", color: "green" },
          { title: "Avg. Time to Hire", value: "28.5 Days", change: "-5%", trend: "down", color: "red" },
          { title: "Offer Acceptance Rate", value: "92%", change: "+3%", trend: "up", color: "green" },
          { title: "Active Candidates", value: "1,240", sub: "Across 15 open roles" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card-light p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-2">
            <h3 className="text-sm font-medium text-slate-500">{kpi.title}</h3>
            <p className="text-3xl font-bold text-text-light">{kpi.value}</p>
            {kpi.change ? (
              <p className={`text-sm flex items-center gap-1 ${kpi.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={kpi.trend === "up" ? "arrow_upward" : "arrow_downward"} className="text-base" />
                {kpi.change} vs last period
              </p>
            ) : (
                <p className="text-sm text-slate-500">{kpi.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-card-light p-6 rounded-xl border border-border-light shadow-sm">
          <h3 className="text-lg font-bold text-text-light mb-6">Hiring Funnel</h3>
          <div className="flex items-center justify-between space-x-2">
            {funnelData.map((stage, i) => (
                <React.Fragment key={i}>
                    <div className="flex flex-col items-center flex-1 text-center group">
                        <div className={`w-full h-10 flex items-center justify-center text-white font-bold text-sm rounded-t-lg transition-transform group-hover:-translate-y-1`} style={{ backgroundColor: stage.color }}>{stage.name}</div>
                        <div className={`w-full h-12 flex items-center justify-center font-bold text-sm shadow-inner`} style={{ backgroundColor: stage.color, filter: 'brightness(1.1)' }}>
                            {Math.round((stage.value / 1500) * 100)}%
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">{stage.value} Cands.</p>
                    </div>
                    {i < funnelData.length - 1 && (
                        <Icon name="chevron_right" className="text-slate-300" />
                    )}
                </React.Fragment>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card-light p-6 rounded-xl border border-border-light shadow-sm">
          <h3 className="text-lg font-bold text-text-light mb-4">Source of Hire</h3>
          <div className="flex items-center justify-center gap-8 h-48">
             <ResponsiveContainer width={180} height={180}>
                <PieChart>
                    <Pie
                        data={sourceData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-col gap-3">
                {sourceData.map((source, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                        <p className="text-sm text-slate-700">{source.name} <span className="font-bold ml-1">{source.value}%</span></p>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="bg-card-light p-6 rounded-xl border border-border-light shadow-sm">
        <h3 className="text-lg font-bold text-text-light mb-6">Hiring Velocity by Department</h3>
        <div className="flex flex-col space-y-5">
            {[
                { label: 'Engineering', count: 18, color: '#3b82f6', width: '80%' },
                { label: 'Sales', count: 12, color: '#10b981', width: '65%' },
                { label: 'Marketing', count: 8, color: '#f97316', width: '40%' },
            ].map((dept, i) => (
                <div key={i} className="flex items-center">
                    <p className="w-24 text-sm font-medium text-slate-600">{dept.label}</p>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                        <div 
                            className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-1000 ease-out" 
                            style={{ width: dept.width, backgroundColor: dept.color }}
                        >
                            {dept.count} hires
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </Layout>
  );
};
