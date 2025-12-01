// ...existing code...
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { useJdContext } from "../context/JdContext";
import { useApplicationContext } from "../context/ApplicationContext";

export const JdLibrary = () => {
  const { jds, addJd, updateJd, deleteJd, loading } = useJdContext();
  const { t } = useApplicationContext();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mode, setMode] = useState('view'); 
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ title: "", company: "", content: "" });

  // Popup Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const activeJd = jds.find(j => j.id === selectedId);

  // --- ACTIONS ---
  const handleAddNew = () => {
    setMode('add');
    setFormData({ title: "", company: "", content: "" });
    setSelectedId(null);
    setIsDrawerOpen(true);
  };

  const handleView = (jd) => {
    setMode('view');
    setSelectedId(jd.id);
    setFormData({ title: jd.title, company: jd.company, content: jd.content });
    setIsDrawerOpen(true);
  };

  const handleEdit = () => {
    setMode('edit');
  };

  // --- LOGIC SAVE (FIXED) ---
  const handleSaveClick = async () => {
    console.log("Save button clicked!", mode, formData); // Debug log

    if (!formData.title || !formData.content) {
      alert(t('library.form_title') + " and " + t('library.form_content') + " are required!");
      return;
    }

    let success = false;
    if (mode === 'add') {
      success = await addJd(formData);
      if (success) {
        setIsDrawerOpen(false); // Thêm xong đóng luôn
      }
    } else if (mode === 'edit' && selectedId) {
      success = await updateJd(selectedId, formData);
      if (success) {
        setMode('view'); // Sửa xong chuyển về view để xem kết quả
      }
    }
  };

  // --- LOGIC DELETE MODAL ---
  const requestDelete = (id, e) => {
    if (e) e.stopPropagation();
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteJd(deleteTargetId);
      if (selectedId === deleteTargetId) setIsDrawerOpen(false);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <Layout title={t('library.title')}>
      <div className="flex flex-row overflow-hidden h-[calc(100vh-64px)] relative bg-slate-50 dark:bg-slate-900">
        
        {/* --- LIST AREA --- */}
        <div className="flex-1 overflow-y-auto p-6 transition-all duration-300">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">{t('library.title')}</h2>
                <p className="text-slate-500 text-sm">{t('library.subtitle')}</p>
              </div>
              <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm min-w-fit whitespace-nowrap">
                <Icon name="add" /> {t('library.add_btn')}
              </button>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-xs">
                  <tr>
                    {/* CĂN GIỮA TOÀN BỘ HEADER */}
                    <th className="px-6 py-4 w-[25%] whitespace-nowrap">{t('library.table_job')}</th>
                    <th className="px-6 py-4 w-[20%] text-center whitespace-nowrap">{t('library.table_company')}</th>
                    <th className="px-6 py-4 w-[20%] text-center whitespace-nowrap">{t('library.table_added')}</th>
                    <th className="px-6 py-4 w-[20%] text-center whitespace-nowrap">{t('library.table_updated')}</th>
                    <th className="px-6 py-4 w-[15%] text-center whitespace-nowrap">{t('pipeline.table_header_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {jds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        {loading ? t('library.add_btn') : "No JDs found. Add one to get started!"}
                      </td>
                    </tr>
                  ) : (
                    jds.map((jd) => (
                      <tr 
                        key={jd.id} 
                        onClick={() => handleView(jd)}
                        className={`cursor-pointer transition-colors ${selectedId === jd.id && isDrawerOpen ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
                      >
                        {/* CĂN GIỮA TOÀN BỘ CELL */}
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                            {jd.title}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-center whitespace-nowrap">
                            {jd.company || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-center whitespace-nowrap">
                            {jd.createdAt}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-center whitespace-nowrap">
                            {jd.updatedAt}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={(e) => requestDelete(jd.id, e)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Icon name="delete" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- DRAWER (FIXED LAYOUT) --- */}
        <div className={`bg-white dark:bg-card-dark border-l border-border-light dark:border-border-dark shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col z-20 ${isDrawerOpen ? 'w-[450px] opacity-100' : 'w-0 opacity-0'}`}>
           <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 shrink-0">
              <div>
                 <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                    {mode === 'add' ? t('library.drawer_create') : mode === 'edit' ? t('library.drawer_edit') : (activeJd?.title || t('library.drawer_view'))}
                 </h2>
                 <p className="text-xs text-slate-500">{mode === 'view' ? 'Read-only view' : 'Fill details below'}</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-200 transition-colors">
                <Icon name="close" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-6 pb-20"> {/* pb-20 để tránh nội dung bị che */}
              {mode === 'view' && activeJd ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                   <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                      <div><span className="block font-bold uppercase text-[10px] mb-1 whitespace-nowrap">{t('library.table_added')}</span>{activeJd.createdAt}</div>
                      <div><span className="block font-bold uppercase text-[10px] mb-1 whitespace-nowrap">{t('library.table_updated')}</span>{activeJd.updatedAt}</div>
                   </div>
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">{t('library.form_content')}</h3>
                      <div className="prose dark:prose-invert text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                         {activeJd.content}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-300">
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('library.form_title')} <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-800 text-text-light dark:text-text-dark" placeholder="e.g. Senior Backend Engineer" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('library.form_company')}</label>
                      <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-800 text-text-light dark:text-text-dark" placeholder="e.g. Tech Corp" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t('library.form_content')} <span className="text-red-500">*</span></label>
                      <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full min-h-[300px] px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-800 font-mono text-sm leading-relaxed text-text-light dark:text-text-dark resize-none" placeholder={t('analyze.manual_placeholder')}></textarea>
                   </div>
                </div>
              )}
           </div>

           <div className="p-6 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/30 shrink-0">
              {mode === 'view' && activeJd ? (
                 <div className="flex gap-3">
                    <button onClick={handleEdit} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm min-w-fit whitespace-nowrap">
                      <Icon name="edit" /> Edit
                    </button>
                    <button onClick={(e) => requestDelete(activeJd.id, e)} className="flex-1 py-2.5 bg-white border border-red-200 text-red-500 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition-colors min-w-fit whitespace-nowrap">
                      <Icon name="delete" /> Delete
                    </button>
                 </div>
              ) : (
                 <div className="flex gap-3">
                    <button onClick={() => setMode('view')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-200 rounded-lg font-bold transition-colors">{t('library.btn_cancel')}</button>
                    <button onClick={handleSaveClick} className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-fit whitespace-nowrap">
                      {mode === 'add' ? <><Icon name="add" /> {t('library.btn_create')}</> : <><Icon name="save" /> {t('library.btn_save')}</>}
                    </button>
                 </div>
              )}
           </div>
        </div>

        {/* --- DELETE POPUP MODAL --- */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl max-w-sm w-full p-6 border border-border-light dark:border-border-dark transform transition-all scale-100">
              <div className="flex flex-col items-center text-center">
                <div className="size-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
                  <Icon name="delete" className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Job?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to delete this Job Description? <br/>This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors">
                    {t('library.btn_cancel')}
                  </button>
                  <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-200 transition-colors">
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};