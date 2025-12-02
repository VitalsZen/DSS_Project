import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { useApplicationContext } from "../context/ApplicationContext";
import { AnalysisResultView } from "../components/AnalysisResultView";

export const CandidatePipeline = () => {
    const navigate = useNavigate(); 
    const { applications, deleteApplication, updateApplication, t } = useApplicationContext();
    
    // State
    const [filterStatus, setFilterStatus] = useState("All"); 
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [isJdOpen, setIsJdOpen] = useState(false); 
    const [editingTitleId, setEditingTitleId] = useState(null);
    const [tempTitle, setTempTitle] = useState("");
    const [sortConfig, setSortConfig] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Filter logic
    const filteredApps = useMemo(() => {
        let apps = [...applications];

    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        apps = apps.filter(app => 
            (app.jobTitle || "").toLowerCase().includes(q) || 
            (app.companyName || "").toLowerCase().includes(q)
        );
    }

    if (filterStatus !== "All") {
        apps = apps.filter(app => app.status === filterStatus);
    }

    if (sortConfig) {
        apps.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    return apps;
  }, [applications, searchTerm, filterStatus, sortConfig]);

  // Helper Function
  const getStatusColor = (status) => {
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium";
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Action Handlers
  const requestDelete = (e, id) => {
    e.stopPropagation();
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteApplication(deleteTargetId);
      if (selectedApp?.id === deleteTargetId) {
          setSelectedApp(null);
      }
    }
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
  };
  
  const handleStatusChange = (e, id) => {
    e.stopPropagation(); 
    const newStatus = e.target.value;
    updateApplication(id, { status: newStatus });
  };

  const startEditingTitle = (e, app) => {
    e.stopPropagation();
    setEditingTitleId(app.id);
    setTempTitle(app.jobTitle);
  };

  const saveTitle = (e) => {
    e.stopPropagation();
    if (editingTitleId && tempTitle.trim()) {
      updateApplication(editingTitleId, { jobTitle: tempTitle });
    }
    setEditingTitleId(null);
  };

  const cancelTitleEdit = (e) => {
    e.stopPropagation();
    setEditingTitleId(null);
  };

  const getParsedData = () => {
    if (!selectedApp) return null;
    try {
        const result = typeof selectedApp.analysisResult === 'string' 
            ? JSON.parse(selectedApp.analysisResult) 
            : selectedApp.analysisResult;
        return result;
    } catch (e) {
        return null;
    }
  };

  const parsedData = getParsedData();

  const getCandidateInfo = () => {
      if (!parsedData?.personal_info) return { 
          name: selectedApp?.jobTitle, 
          position: selectedApp?.companyName,
          experience: "" 
      };
      
      return {
          name: parsedData.personal_info.name || "Unknown Candidate",
          position: parsedData.personal_info.position || "N/A",
          experience: parsedData.personal_info.experience || "Exp N/A"
      };
  };

  const candidateInfo = getCandidateInfo();

  return (
    <Layout title={t('sidebar.pipeline')}>
      <div className="flex flex-col h-full gap-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('pipeline.search_placeholder')} 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                 />
                 <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              </div>
              
              <div className="relative">
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[180px]"
                 >
                    <option value="All">{t('pipeline.status_all')}</option>
                    <option value="Wishlist">{t('status.Wishlist')}</option>
                    <option value="Applied">{t('status.Applied')}</option>
                    <option value="Interviewing">{t('status.Interviewing')}</option>
                    <option value="Offer Received">{t('status.Offer Received')}</option>
                    <option value="Rejected">{t('status.Rejected')}</option>
                 </select>
                 <Icon name="filter_list" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                  onClick={() => navigate('/jobs')} 
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm min-w-fit whitespace-nowrap">
                  <Icon name="add" className="text-lg" /> {t('pipeline.new_btn')}
              </button>
           </div>
        </div>

        {/* Table View */}
        <div className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                 <thead className="bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 font-medium border-b border-border-light dark:border-border-dark">
                    <tr>
                       <th className="px-4 py-3 w-12 text-center text-xs whitespace-nowrap">#</th>
                       <th 
                           className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group select-none whitespace-nowrap"
                           onClick={() => handleSort('jobTitle')}
                       >
                           <div className="flex items-center gap-1">
                               <span className="whitespace-nowrap">{t('pipeline.table_header_job')}</span>
                               {sortConfig?.key === 'jobTitle' && (
                                   <Icon name={sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'} className="text-xs" />
                               )}
                           </div>
                       </th>
                       <th className="px-4 py-3 w-56 text-center whitespace-nowrap">{t('dashboard.table.status')}</th>
                       <th 
                           className="px-4 py-3 w-[25%] text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group select-none whitespace-nowrap"
                           onClick={() => handleSort('matchScore')}
                       >
                           <div className="flex items-center justify-center gap-1">
                               <span className="whitespace-nowrap">{t('dashboard.table.score')}</span>
                               {sortConfig?.key === 'matchScore' && (
                                   <Icon name={sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'} className="text-xs" />
                               )}
                           </div>
                       </th>
                       <th 
                           className="px-4 py-3 w-40 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group select-none whitespace-nowrap"
                           onClick={() => handleSort('dateApplied')}
                       >
                           <div className="flex items-center justify-center gap-1">
                               <span className="whitespace-nowrap">{t('dashboard.table.date')}</span>
                               {sortConfig?.key === 'dateApplied' && (
                                   <Icon name={sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'} className="text-xs" />
                               )}
                           </div>
                       </th>
                       <th className="px-6 py-3 w-32 text-center whitespace-nowrap">{t('pipeline.table_header_actions')}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {filteredApps.map((app, index) => (
                       <tr 
                           key={app.id} 
                           onClick={() => { setSelectedApp(app); setIsJdOpen(false); }} 
                           className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                       >
                          <td className="px-4 py-3 text-center text-slate-400 text-xs">{index + 1}</td>
                          <td className="px-4 py-3 align-middle">
                             <div className="flex flex-col justify-center min-h-[40px]">
                                {editingTitleId === app.id ? (
                                   <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <input 
                                         autoFocus
                                         value={tempTitle}
                                         onChange={(e) => setTempTitle(e.target.value)}
                                         className="flex-1 px-2 py-1 text-sm border border-primary rounded shadow-sm focus:outline-none"
                                         onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveTitle(e);
                                            if (e.key === 'Escape') cancelTitleEdit(e);
                                         }}
                                      />
                                      <button onClick={saveTitle} className="p-1 text-green-600 hover:bg-green-100 rounded"><Icon name="check" className="text-lg" /></button>
                                      <button onClick={cancelTitleEdit} className="p-1 text-red-600 hover:bg-red-100 rounded"><Icon name="close" className="text-lg" /></button>
                                   </div>
                                ) : (
                                   <>
                                      <span 
                                         className="font-bold text-text-light dark:text-text-dark block hover:underline hover:text-primary cursor-text w-fit whitespace-nowrap"
                                         onClick={(e) => startEditingTitle(e, app)}
                                         title={t('pipeline.table_header_job')}
                                      >
                                         {app.jobTitle}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 whitespace-nowrap">{app.companyName}</span>
                                   </>
                                )}
                             </div>
                          </td>
                          <td className="px-4 py-3 text-center w-fit">
                             <div className="relative inline-block w-[180px] mx-auto" onClick={e => e.stopPropagation()}>
                                <select 
                                   value={app.status}
                                   onChange={(e) => handleStatusChange(e, app.id)}
                                   className={`appearance-none w-full pl-3 pr-9 py-1.5 rounded-md text-sm font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30 transition-all ${getStatusColor(app.status)}`}
                                   style={{ textAlignLast: 'center' }}
                                >
                                   <option value="Wishlist">{t('status.Wishlist')}</option>
                                   <option value="Applied">{t('status.Applied')}</option>
                                   <option value="Interviewing">{t('status.Interviewing')}</option>
                                   <option value="Offer Received">{t('status.Offer Received')}</option>
                                   <option value="Rejected">{t('status.Rejected')}</option>
                                </select>
                                <Icon 
                                    name="expand_more" 
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${app.status.includes('Received') ? 'text-green-800' : 'text-slate-600'}`} 
                                />
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-3 justify-center">
                                <div className="w-full max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                   <div className={`h-full rounded-full ${app.matchScore >= 90 ? 'bg-green-500' : app.matchScore >= 75 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${app.matchScore}%` }} />
                                </div>
                                <span className={`text-xs font-bold w-8 text-right ${getScoreColor(app.matchScore)}`}>{app.matchScore}%</span>
                             </div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                             <span className=" text-slate-600 dark:text-slate-400 text-sm">
                                {app.dateApplied}
                             </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                             <button onClick={(e) => requestDelete(e, app.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title={t('pipeline.table_header_actions')}>
                                <Icon name="delete" className="text-lg" />
                             </button>
                          </td>
                       </tr>
                    ))}
                    {filteredApps.length === 0 && (
                       <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">{t('pipeline.no_data')}</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
           <div className="px-4 py-2 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-500 flex justify-between items-center">
              <span>{filteredApps.length} {t('pipeline.records')}</span>
           </div>
        </div>

      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-background-light dark:bg-background-dark w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white dark:bg-card-dark shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                            {candidateInfo.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-bold text-text-light dark:text-text-dark leading-tight">
                                {candidateInfo.name}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Icon name="badge" className="text-sm" /> {candidateInfo.position}
                                </span>
                                {candidateInfo.experience && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Icon name="history" className="text-sm" /> {candidateInfo.experience}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold border border-transparent ${getStatusColor(selectedApp.status)}`}>
                            {t(`status.${selectedApp.status}`)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsJdOpen(!isJdOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${isJdOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} min-w-fit whitespace-nowrap`}
                        >
                            <Icon name="description" /> {t('compare.view_jd_btn')}
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                            <Icon name="close" className="text-2xl" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden relative">
                    
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300">
                         {parsedData ? (
                             <AnalysisResultView 
                                data={parsedData}
                                customTitle={selectedApp.jobTitle}
                                customSubtitle={`${t('dashboard.table.date')}: ${selectedApp.dateApplied}`}
                             />
                         ) : (
                             <div className="text-center py-20 text-slate-400">
                                 <Icon name="error" className="text-4xl mb-2" />
                                 <p>{t('pipeline.data_corrupted')}</p>
                             </div>
                         )}
                    </div>

                    <div className={`border-l border-border-light dark:border-border-dark bg-white dark:bg-card-dark transition-all duration-300 ease-in-out flex flex-col ${isJdOpen ? 'w-[400px] translate-x-0' : 'w-0 translate-x-full hidden'}`}>
                        <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/30 font-bold text-sm text-slate-700 dark:text-slate-300 flex justify-between items-center shrink-0">
                            <span className="whitespace-nowrap">{t('compare.original_jd')}</span>
                            <button onClick={() => setIsJdOpen(false)}><Icon name="close" className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="mb-4">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white whitespace-nowrap">{selectedApp.jobTitle}</h4>
                                <p className="text-primary font-medium text-sm whitespace-nowrap">{selectedApp.companyName}</p>
                            </div>
                            <div className="prose dark:prose-invert text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                {selectedApp.jdContent || t('pipeline.source_text')}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl max-w-sm w-full p-6 border border-border-light dark:border-border-dark transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="size-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
                <Icon name="delete" className="text-3xl" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('modal.delete_title')}</h3>
              <p className="text-slate-500 text-sm mb-6">
                {t('modal.delete_confirm')} <br/>{t('modal.delete_warning')}
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                >
                  {t('modal.btn_cancel')}
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-200 transition-colors"
                >
                  {t('modal.btn_confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
