import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { useJdContext } from "../context/JdContext";
import { useApplicationContext } from "../context/ApplicationContext"; 

export const JobManagement = () => {
  const navigate = useNavigate();
  const { jds } = useJdContext();
  
  const { runBackgroundAnalysis, isAnalyzing, t } = useApplicationContext();
  
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJdId, setSelectedJdId] = useState("");
  const [jdText, setJdText] = useState("");
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleJdSelect = (e) => {
    const id = e.target.value;
    setSelectedJdId(id);
    if (id) {
      const savedJd = jds.find(j => j.id === id);
      if (savedJd) setJdText(savedJd.content);
    } else {
      setJdText("");
    }
  };

  const handleClearJdSelection = () => {
    setSelectedJdId("");
    setJdText("");
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setError(t('analyze.error_upload'));
      return;
    }
    if (!jdText && !selectedJdId) {
      setError(t('analyze.error_jd'));
      return;
    }

    setError(null);

    try {
      console.log("Starting background analysis...");
      await runBackgroundAnalysis(selectedFile, jdText, selectedJdId);
      navigate('/compare');
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis failed.");
    }
  };

  return (
    <Layout title={t('analyze.title')}>
      <div className="max-w-4xl mx-auto w-full py-6">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <Icon name="search_check" className="text-3xl" />
            </div>
            <h1 className="text-3xl font-black text-text-light dark:text-text-dark mb-2">{t('analyze.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                {t('analyze.subtitle')}
            </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-xl shadow-slate-200/50 dark:shadow-none p-1">
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-t-xl border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="size-10 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-center text-red-500 shadow-sm shrink-0">
                        <Icon name="picture_as_pdf" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-light dark:text-text-dark">{t('analyze.active_cv')}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                            {selectedFile ? selectedFile.name : t('analyze.no_file')}
                        </p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <button 
                        onClick={handleTriggerUpload}
                        className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 text-text-light dark:text-text-dark rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 min-w-fit whitespace-nowrap"
                    >
                        <Icon name="upload_file" />
                        {selectedFile ? t('analyze.change_pdf') : t('analyze.import_pdf')}
                    </button>
                 </div>
            </div>

            <div className="p-6 md:p-8">
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <Icon name="description" className="text-primary" />
                    {t('analyze.jd_source')}
                 </label>

                 <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <select 
                            value={selectedJdId}
                            onChange={handleJdSelect}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm font-medium text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors min-w-[220px]"
                        >
                            <option value="">{t('analyze.select_placeholder')}</option>
                            {jds.length > 0 ? (
                              jds.map(jd => (
                                <option key={jd.id} value={jd.id}>{jd.title} {jd.company ? `- ${jd.company}` : ''}</option>
                              ))
                            ) : (
                              <option disabled>{t('library.subtitle')}</option>
                            )}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Icon name="expand_more" />
                        </span>
                    </div>
                    
                    {selectedJdId && (
                        <button 
                            onClick={handleClearJdSelection}
                            className="p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-w-fit"
                            title="Clear Selection"
                        >
                            <Icon name="close" />
                        </button>
                    )}
                 </div>

                 <div className="relative group">
                    <div className={`absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl pointer-events-none transition-opacity duration-200 ${selectedJdId ? 'opacity-100' : 'opacity-0'}`} />
                    <textarea 
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        disabled={!!selectedJdId}
                        className={`w-full p-6 rounded-xl border-2 ${selectedJdId ? 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:border-primary'} focus:outline-none focus:ring-0 resize-y min-h-[400px] font-mono text-sm leading-relaxed transition-all placeholder:text-slate-400`}
                        placeholder={selectedJdId ? "" : t('analyze.manual_placeholder')}
                    ></textarea>
                    {selectedJdId && (
                        <div className="absolute top-4 right-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded">
                            {t('analyze.locked')}
                        </div>
                    )}
                 </div>
                 
                 {error && (
                   <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg flex items-center gap-2">
                      <Icon name="error" /> {error}
                   </div>
                 )}
            </div>
            
            <div className="p-6 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 rounded-b-xl flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button 
                    onClick={handleRunAnalysis}
                    disabled={!selectedFile || (!jdText && !selectedJdId) || isAnalyzing}
                    className={`w-full sm:w-auto px-10 py-4 text-lg font-bold rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-3 ${
                        (!selectedFile || (!jdText && !selectedJdId) || isAnalyzing)
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30 hover:-translate-y-1' 
                    }`}
                >
                    {isAnalyzing ? (
                        <>
                           <Icon name="loader" className="animate-spin text-2xl" /> {t('analyze.btn_analyzing')}
                        </>
                    ) : (
                        <>
                           {t('analyze.btn_run')}
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </Layout>
  );
};
