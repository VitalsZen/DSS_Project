// ...existing code...
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { useApplicationContext } from "../context/ApplicationContext";
// Import thêm JdContext để dùng hàm addJd
import { useJdContext } from "../context/JdContext"; 
import { AnalysisResultView } from "../components/AnalysisResultView";

export const CompareCandidates = () => {
  const { lastAnalysisResult, lastJdSource, addApplication, t } = useApplicationContext();
  // Lấy danh sách JD và hàm thêm mới
  const { jds, addJd } = useJdContext(); 
  
  const navigate = useNavigate();
  const location = useLocation();

  const displayResult = lastAnalysisResult || location.state?.analysisResult;
  const displaySource = lastJdSource || location.state?.jdSource;

  const [isJdDrawerOpen, setIsJdDrawerOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Form State
  const [saveForm, setSaveForm] = useState({ jobTitle: "", companyName: "", status: "Applied" });
  const [errors, setErrors] = useState({ jobTitle: "" });

  // Logic Auto-fill & Lock
  const isFromLibrary = displaySource?.type === 'library' && displaySource?.id;

  useEffect(() => {
      if (isFromLibrary) {
          const sourceJd = jds.find(j => j.id === displaySource.id);
          setSaveForm(prev => ({
              ...prev,
              jobTitle: sourceJd?.title || displaySource.title || "", 
              companyName: sourceJd?.company || displaySource.company || ""
          }));
      } else {
          setSaveForm(prev => ({
              ...prev,
              jobTitle: "",
              companyName: ""
          }));
      }
      setErrors({ jobTitle: "" });
  }, [displaySource, isFromLibrary, jds, isSaveModalOpen]);

  // --- HÀM SAVE ĐÃ CẬP NHẬT TÍNH NĂNG AUTO-SAVE JD ---
  const handleSave = async (e) => {
      e.preventDefault();
      if (!displayResult) return;
      
      // Validation
      if (!saveForm.jobTitle.trim()) {
          setErrors({ jobTitle: "Job Title is required" });
          return;
      }

      // 1. Tự động lưu JD nếu là Manual Paste (Không có trong thư viện)
      if (!isFromLibrary && displaySource?.content) {
          try {
              console.log("Auto-saving new JD to Library...");
              await addJd({
                  title: saveForm.jobTitle,       // Lấy từ ô nhập
                  company: saveForm.companyName,  // Lấy từ ô nhập
                  content: displaySource.content  // Lấy nội dung gốc
              });
          } catch (err) {
              console.error("Failed to auto-save JD:", err);
              // Không chặn luồng chính, vẫn tiếp tục lưu Application
          }
      }

      // 2. Lưu Application vào lịch sử
      await addApplication({
          companyName: saveForm.companyName || "",
          jobTitle: saveForm.jobTitle,
          matchScore: displayResult.matching_score.percentage,
          status: saveForm.status,
          analysisResult: displayResult,
          jdContent: displaySource?.content || ""
      });

      setIsSaveModalOpen(false);
      navigate('/pipeline');
  };

  const getCandidateName = () => {
      if (!displayResult?.personal_info) return "Candidate";
      return displayResult.personal_info.name || "Unknown Candidate";
  };

  if (!displayResult) {
    return (
        <Layout title={t('sidebar.compare')}>
          <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
            <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Icon name="analytics" className="text-5xl text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('compare.no_analysis_title')}</h2>
            <p className="text-slate-500 max-w-md mb-8">
                {t('compare.no_analysis_description')}
            </p>
            <button 
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center gap-2 min-w-fit whitespace-nowrap"
            >
                <Icon name="search_check" /> {t('sidebar.analyze')}
            </button>
          </div>
        </Layout>
    );
  }

  return (
    <Layout title={t('compare.save_modal_title')}>
      <div className="flex flex-row overflow-hidden relative h-[calc(100vh-64px)]">
        
        {/* Main Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 ease-in-out">
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                
                {/* Header Section */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20 shrink-0">
                            {getCandidateName().split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
                                {getCandidateName()}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <span className="flex items-center gap-1">
                                    <Icon name="badge" className="text-primary text-base" /> 
                                    {displayResult.personal_info.position || "N/A"}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1">
                                    <Icon name="history" className="text-primary text-base" /> 
                                    {displayResult.personal_info.experience || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => setIsJdDrawerOpen(!isJdDrawerOpen)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${isJdDrawerOpen ? 'bg-primary/10 border-primary text-primary' : 'border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800'} min-w-fit whitespace-nowrap`}
                        >
                            <Icon name="description" /> {t('compare.view_jd_btn')}
                        </button>

                        <button 
                            onClick={() => setIsSaveModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm min-w-fit whitespace-nowrap"
                        >
                            <Icon name="save" /> {t('compare.save_btn')}
                        </button>
                    </div>
                </div>

                {/* Render Component */}
                <AnalysisResultView data={displayResult} />

            </div>
        </div>

        {/* Right Side JD Panel */}
        <div className={`bg-white dark:bg-card-dark border-l border-border-light dark:border-border-dark shadow-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col z-20 ${isJdDrawerOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0'}`}>
            <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 shrink-0">
               <div>
                  <h2 className="text-lg font-bold text-text-light dark:text-text-dark">{t('compare.original_jd')}</h2>
                  <p className="text-xs text-slate-500">Source text</p>
               </div>
               <button onClick={() => setIsJdDrawerOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500">
                  <Icon name="close_fullscreen" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
               <div className="prose dark:prose-invert text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  {displaySource?.content || "No content found."}
               </div>
            </div>
        </div>

        {/* Save Modal */}
        {isSaveModalOpen && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                   <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/10">
                      <h2 className="text-lg font-bold text-text-light dark:text-text-dark">{t('compare.save_modal_title')}</h2>
                      <button onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
                   </div>
                   <form onSubmit={handleSave} className="p-6 space-y-5">
                       
                       {/* Job Title */}
                       <div>
                           <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                               {t('library.form_title')} <span className="text-red-500">*</span>
                           </label>
                           <input 
                                type="text" 
                                value={saveForm.jobTitle} 
                                onChange={e => {
                                    setSaveForm({...saveForm, jobTitle: e.target.value});
                                    if(e.target.value.trim()) setErrors({...errors, jobTitle: ""});
                                }}
                                disabled={isFromLibrary}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none 
                                    ${errors.jobTitle ? 'border-red-500 bg-red-50' : isFromLibrary ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}
                                `}
                                placeholder="e.g. Senior React Developer"
                           />
                           {errors.jobTitle && <p className="text-xs text-red-500 mt-1 font-bold">{errors.jobTitle}</p>}
                           
                           {isFromLibrary && !errors.jobTitle && <p className="text-[10px] text-slate-400 mt-1 italic">Locked because this is a saved JD.</p>}
                       </div>

                       {/* Company Name */}
                       <div>
                           <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                               {t('library.form_company')}
                           </label>
                           <input 
                                type="text" 
                                value={saveForm.companyName} 
                                onChange={e => setSaveForm({...saveForm, companyName: e.target.value})} 
                                disabled={isFromLibrary} 
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${isFromLibrary ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                                placeholder="e.g. Tech Corp (Optional)"
                           />
                       </div>

                       {/* Status */}
                       <div>
                           <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('dashboard.table.status')}</label>
                           <div className="relative">
                               <select 
                                    value={saveForm.status}
                                    onChange={(e) => setSaveForm({...saveForm, status: e.target.value})}
                                    className="w-full appearance-none px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-800"
                               >
                                   <option value="Wishlist">Wishlist</option>
                                   <option value="Applied">Applied</option>
                                   <option value="Interviewing">Interviewing</option>
                                   <option value="Offer Received">Offer Received</option>
                                   <option value="Rejected">Rejected</option>
                               </select>
                               <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                   <Icon name="expand_more" />
                               </span>
                           </div>
                       </div>

                       <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                           <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">{t('library.btn_cancel')}</button>
                           <button type="submit" className="px-6 py-2.5 rounded-lg font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">{t('compare.confirm_save')}</button>
                       </div>
                   </form>
                </div>
             </div>
        )}

      </div>
    </Layout>
  );
};