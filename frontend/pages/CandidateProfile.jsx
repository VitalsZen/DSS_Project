import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { useApplicationContext } from "../context/ApplicationContext";

// Mock data for candidates in pipeline
const MOCK_CANDIDATES = [
  {
    id: 1,
    name: "Le Hoang Dang",
    position: "Java Developer",
    appliedDate: "2024-01-15",
    matchScore: 86,
    status: "interview_scheduled",
    avatar: "https://ui-avatars.com/api/?name=Le+Hoang+Dang&background=137fec&color=fff&size=80"
  },
  {
    id: 2,
    name: "Nguyen Van A",
    position: "Frontend Developer",
    appliedDate: "2024-01-18",
    matchScore: 92,
    status: "new",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=10b981&color=fff&size=80"
  },
  {
    id: 3,
    name: "Tran Thi B",
    position: "Full Stack Developer",
    appliedDate: "2024-01-20",
    matchScore: 78,
    status: "screening",
    avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=f59e0b&color=fff&size=80"
  },
  {
    id: 4,
    name: "Pham Minh C",
    position: "Backend Developer",
    appliedDate: "2024-01-22",
    matchScore: 88,
    status: "offer_sent",
    avatar: "https://ui-avatars.com/api/?name=Pham+Minh+C&background=8b5cf6&color=fff&size=80"
  },
  {
    id: 5,
    name: "Hoang Thu D",
    position: "UI/UX Designer",
    appliedDate: "2024-01-25",
    matchScore: 95,
    status: "hired",
    avatar: "https://ui-avatars.com/api/?name=Hoang+Thu+D&background=ec4899&color=fff&size=80"
  },
  {
    id: 6,
    name: "Vu Hai E",
    position: "DevOps Engineer",
    appliedDate: "2024-01-28",
    matchScore: 65,
    status: "rejected",
    avatar: "https://ui-avatars.com/api/?name=Vu+Hai+E&background=ef4444&color=fff&size=80"
  }
];

const STATUS_CONFIG = {
  new: {
    iconKey: "fiber_new",
    colorClass: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
  },
  screening: {
    iconKey: "search",
    colorClass: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50"
  },
  interview_scheduled: {
    iconKey: "event",
    colorClass: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/50"
  },
  offer_sent: {
    iconKey: "mail",
    colorClass: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50"
  },
  hired: {
    iconKey: "check_circle",
    colorClass: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50"
  },
  rejected: {
    iconKey: "cancel",
    colorClass: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50"
  }
};

export const CandidatePipeline = () => {
  const { t } = useApplicationContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  // Filter and sort candidates
  const filteredCandidates = MOCK_CANDIDATES
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || candidate.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.appliedDate) - new Date(a.appliedDate);
        case "date_asc":
          return new Date(a.appliedDate) - new Date(b.appliedDate);
        case "score_desc":
          return b.matchScore - a.matchScore;
        case "score_asc":
          return a.matchScore - b.matchScore;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${config.colorClass}`}>
        <Icon name={config.iconKey} className="text-sm" fill />
        {t(`candidate_pipeline.status.${status}`)}
      </span>
    );
  };

  return (
    <Layout title={t('candidate_pipeline.page_title')}>
      <div className="flex flex-col gap-6 w-full h-full pb-8">
        
        {/* Header with Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.keys(STATUS_CONFIG).map((status) => {
            const count = MOCK_CANDIDATES.filter(c => c.status === status).length;
            const config = STATUS_CONFIG[status];
            return (
              <div
                key={status}
                className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStatus(status === selectedStatus ? "all" : status)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon name={config.iconKey} className={`text-2xl ${config.colorClass.split(' ')[2]}`} fill />
                  <span className="text-2xl font-black text-text-light dark:text-text-dark">{count}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t(`candidate_pipeline.status.${status}`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters and Controls */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="text"
                  placeholder={t('candidate_pipeline.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-lg text-text-light dark:text-text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-64">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium cursor-pointer"
              >
                <option value="all">{t('candidate_pipeline.filter.all_status')}</option>
                {Object.keys(STATUS_CONFIG).map((status) => (
                  <option key={status} value={status}>
                    {t(`candidate_pipeline.status.${status}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="w-full lg:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-lg text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium cursor-pointer"
              >
                <option value="date_desc">{t('candidate_pipeline.sort.date_desc')}</option>
                <option value="date_asc">{t('candidate_pipeline.sort.date_asc')}</option>
                <option value="score_desc">{t('candidate_pipeline.sort.score_desc')}</option>
                <option value="score_asc">{t('candidate_pipeline.sort.score_asc')}</option>
                <option value="name_asc">{t('candidate_pipeline.sort.name_asc')}</option>
                <option value="name_desc">{t('candidate_pipeline.sort.name_desc')}</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedStatus !== "all") && (
            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {t('candidate_pipeline.active_filters')}:
              </span>
              {searchTerm && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                  {t('candidate_pipeline.search_label')}: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-red-600">
                    <Icon name="close" className="text-sm" />
                  </button>
                </span>
              )}
              {selectedStatus !== "all" && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                  {t('candidate_pipeline.status_label')}: {t(`candidate_pipeline.status.${selectedStatus}`)}
                  <button onClick={() => setSelectedStatus("all")} className="hover:text-red-600">
                    <Icon name="close" className="text-sm" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                }}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline ml-2"
              >
                {t('candidate_pipeline.clear_all')}
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {t('candidate_pipeline.showing_results', { count: filteredCandidates.length, total: MOCK_CANDIDATES.length })}
          </p>
        </div>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-12 text-center shadow-sm">
            <Icon name="search_off" className="text-6xl text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
              {t('candidate_pipeline.no_results')}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {t('candidate_pipeline.try_different_filters')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20 text-primary font-bold text-xl group-hover:scale-110 transition-transform">
                      {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-1 truncate group-hover:text-primary transition-colors">
                        {candidate.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Icon name="badge" className="text-base text-primary" />
                          <span className="font-medium">{candidate.position}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon name="calendar_today" className="text-base text-primary" />
                          <span className="font-medium">{new Date(candidate.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center gap-3 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-6">
                    <div className="relative size-16 shrink-0">
                      <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="stroke-slate-100 dark:stroke-slate-800"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          strokeWidth="8"
                        />
                        <circle
                          className="stroke-primary transition-all duration-500"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - candidate.matchScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-primary">{candidate.matchScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                        {t('candidate_pipeline.match_score')}
                      </p>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {candidate.matchScore >= 80 ? t('candidate_pipeline.match_level.excellent') :
                         candidate.matchScore >= 60 ? t('candidate_pipeline.match_level.good') :
                         t('candidate_pipeline.match_level.fair')}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-6">
                    <StatusBadge status={candidate.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-6">
                    <button
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg transition-colors group/btn"
                      title={t('candidate_pipeline.actions.view_profile')}
                    >
                      <Icon name="visibility" className="text-xl" />
                    </button>
                    <button
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg transition-colors group/btn"
                      title={t('candidate_pipeline.actions.send_email')}
                    >
                      <Icon name="email" className="text-xl" />
                    </button>
                    <button
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg transition-colors group/btn"
                      title={t('candidate_pipeline.actions.more')}
                    >
                      <Icon name="more_vert" className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (placeholder) */}
        {filteredCandidates.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button className="p-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <Icon name="chevron_left" />
            </button>
            <span className="px-4 py-2 bg-primary text-white rounded-lg font-bold">1</span>
            <span className="px-4 py-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium">2</span>
            <span className="px-4 py-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium">3</span>
            <button className="p-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Icon name="chevron_right" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
