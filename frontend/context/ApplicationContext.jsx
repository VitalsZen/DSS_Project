import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.pipeline': 'My Applications',
    'sidebar.library': 'JD Library',
    'sidebar.analyze': 'Analyze New Job',
    'sidebar.compare': 'Fit Gap Analysis',
    'sidebar.stats': 'Stats & Insights',
    'sidebar.track': 'Track a New Job',
    'sidebar.analyze_now': 'Analyze Now',
    
    // Dashboard (Tab 1)
    'dashboard.analyses': 'Total Analyses Run',
    'dashboard.applications': 'Total Applications',
    'dashboard.saved_jds': 'Saved JDs',
    'dashboard.perfect_matches': 'Perfect Matches',
    'dashboard.activity': 'Analysis Activity',
    'dashboard.activity_sub': 'Applications created over the last 30 days',
    'dashboard.recent': 'Recent Applications',
    'dashboard.view_all': 'View All',
    'dashboard.no_apps': 'No applications found. Start by analyzing a new job!',
    'dashboard.table.company': 'Company',
    'dashboard.table.role': 'Role',
    'dashboard.table.date': 'Date Analyzed',
    'dashboard.table.status': 'Status',
    'dashboard.table.score': 'Match Score',
    
    // My Applications (Tab 2)
    'pipeline.search_placeholder': 'Search by Job Name...',
    'pipeline.status_all': 'All Status',
    'pipeline.new_btn': 'New',
    'pipeline.table_header_job': 'Job Name',
    'pipeline.table_header_actions': 'Actions',
    'pipeline.no_data': 'No applications found matching your filters.',
    'pipeline.records': 'records',
    
    // JD Library (Tab 6)
    'library.title': 'Saved Job Descriptions',
    'library.subtitle': 'Manage your repository of JDs for quick analysis.',
    'library.add_btn': 'Add New JD',
    'library.table_job': 'Job Title',
    'library.table_company': 'Company',
    'library.table_added': 'Added',
    'library.table_updated': 'Last Updated',
    'library.drawer_create': 'Create New JD',
    'library.drawer_edit': 'Edit Job Description',
    'library.drawer_view': 'Job Details',
    'library.form_title': 'Job Title',
    'library.form_company': 'Company Name',
    'library.form_content': 'JD Content',
    'library.btn_cancel': 'Cancel',
    'library.btn_create': 'Create JD',
    'library.btn_save': 'Save Changes',
    
    // Analyze New Job (Tab 3)
    'analyze.title': 'Check Your Fit Instantly',
    'analyze.subtitle': 'Paste a job description or select a saved one to compare against your CV.',
    'analyze.active_cv': 'Active CV',
    'analyze.no_file': 'No file selected',
    'analyze.change_pdf': 'Change PDF',
    'analyze.import_pdf': 'Import PDF',
    'analyze.jd_source': 'Job Description (JD) Source',
    'analyze.select_placeholder': '-- Paste Manual JD or Select Saved --',
    'analyze.manual_placeholder': 'Paste the full Job Description here...',
    'analyze.locked': 'Locked (Saved JD)',
    'analyze.btn_run': 'Run Match Analysis',
    'analyze.btn_analyzing': 'Analyzing...',
    
    // Fit Gap Analysis (Tab 4/5)
    'compare.save_btn': 'Save Analysis',
    'compare.view_jd_btn': 'View JD',
    'compare.original_jd': 'Original Job Description',
    'compare.save_modal_title': 'Save to Applications',
    'compare.confirm_save': 'Confirm Save',
    'compare.no_analysis_title': 'No Analyses Yet',
    'compare.no_analysis_description': 'Please go to the "Analyze New Job" tab and run an analysis to see results here.',

    // --- RESULT & PROFILE ---
    'candidate_pipelin.page_title': 'Match Analysis candidate_pipelins',
    'candidate_pipelin.pdf_viewer': 'PDF Resume Viewer',
    'candidate_pipelin.download_pdf': 'Download Original PDF',
    'candidate_pipelin.match_score_title': 'Matching Score',
    'candidate_pipelin.match_label': 'Match',
    'candidate_pipelin.score_explanation': 'Based on JD requirements',
    'candidate_pipelin.must_have': 'Must Have:',
    'candidate_pipelin.nice_to_have': 'Nice to Have:',
    'candidate_pipelin.keywords_title': 'Matched Keywords',
    'candidate_pipelin.radar_title': 'Skill Assessment',
    'candidate_pipelin.gen_assessment': 'General Assessment',
    'candidate_pipelin.fit_gap_title': 'Fit Gap Analysis', 
    'candidate_pipelin.table_req': 'Job Requirement (JD)',
    'candidate_pipelin.table_evidence': 'Evidence in CV',
    'candidate_pipelin.table_status': 'Status',
    'candidate_pipelin.status_matched': 'Matched',
    'candidate_pipelin.status_missing': 'Missing',
    'candidate_pipelin.strengths': 'Strengths',
    'candidate_pipelin.weaknesses': 'Weaknesses / Missing Skills',
    'candidate_pipelin.interview_q': 'Recommended Interview Questions',
    'candidate_pipelin.btn_print': 'Print Report',
    'candidate_pipelin.btn_send': 'Send Interview Request',
  },
  vi: {
    // Sidebar
    'sidebar.dashboard': 'Tổng Quan',
    'sidebar.pipeline': 'Đơn Ứng Tuyển',
    'sidebar.library': 'Thư Viện JD',
    'sidebar.analyze': 'Phân Tích Mới',
    'sidebar.compare': 'Kết Quả Phân Tích',
    'sidebar.stats': 'Thống kê & Chi tiết',
    'sidebar.track': 'Theo dõi việc mới',
    'sidebar.analyze_now': 'Phân tích ngay',
    
    // Dashboard (Tab 1)
    'dashboard.analyses': 'Tổng phân tích',
    'dashboard.applications': 'Tổng đơn đã lưu',
    'dashboard.saved_jds': 'JD đã lưu',
    'dashboard.perfect_matches': 'Khớp tuyệt đối',
    'dashboard.activity': 'Hoạt động phân tích',
    'dashboard.activity_sub': 'Đơn tạo trong 30 ngày qua',
    'dashboard.recent': 'Đơn gần đây',
    'dashboard.view_all': 'Xem tất cả',
    'dashboard.no_apps': 'Chưa có đơn nào. Hãy bắt đầu phân tích công việc mới!',
    'dashboard.table.company': 'Công ty',
    'dashboard.table.role': 'Vị trí',
    'dashboard.table.date': 'Ngày phân tích',
    'dashboard.table.status': 'Trạng thái',
    'dashboard.table.score': 'Điểm phù hợp',
    
    // My Applications (Tab 2)
    'pipeline.search_placeholder': 'Tìm theo tên công việc...',
    'pipeline.status_all': 'Tất cả trạng thái',
    'pipeline.new_btn': 'Thêm mới',
    'pipeline.table_header_job': 'Tên công việc',
    'pipeline.table_header_actions': 'Thao tác',
    'pipeline.no_data': 'Không tìm thấy đơn nào phù hợp bộ lọc.',
    'pipeline.records': 'bản ghi',
    
    // JD Library (Tab 6)
    'library.title': 'Thư viện JD đã lưu',
    'library.subtitle': 'Quản lý kho JD để phân tích nhanh.',
    'library.add_btn': 'Thêm JD Mới',
    'library.table_job': 'Tên công việc',
    'library.table_company': 'Công ty',
    'library.table_added': 'Ngày thêm',
    'library.table_updated': 'Cập nhật cuối',
    'library.drawer_create': 'Tạo JD Mới',
    'library.drawer_edit': 'Chỉnh sửa JD',
    'library.drawer_view': 'Chi tiết công việc',
    'library.form_title': 'Tên công việc',
    'library.form_company': 'Tên công ty',
    'library.form_content': 'Nội dung JD',
    'library.btn_cancel': 'Hủy',
    'library.btn_create': 'Tạo JD',
    'library.btn_save': 'Lưu thay đổi',
    
    // Analyze New Job (Tab 3)
    'analyze.title': 'Kiểm tra độ phù hợp ngay',
    'analyze.subtitle': 'Dán mô tả công việc hoặc chọn JD đã lưu để so sánh với CV của bạn.',
    'analyze.active_cv': 'CV hiện tại',
    'analyze.no_file': 'Chưa chọn file',
    'analyze.change_pdf': 'Đổi PDF',
    'analyze.import_pdf': 'Nhập PDF',
    'analyze.jd_source': 'Nguồn Mô tả công việc (JD)',
    'analyze.select_placeholder': '-- Dán JD thủ công hoặc Chọn đã lưu --',
    'analyze.manual_placeholder': 'Dán toàn bộ nội dung JD vào đây...',
    'analyze.locked': 'Đã khóa (JD đã lưu)',
    'analyze.btn_run': 'Chạy phân tích',
    'analyze.btn_analyzing': 'Đang phân tích...',

    // --- candidate_pipelin & PROFILE (MỚI THÊM - VIỆT HÓA) ---
    'candidate_pipelin.page_title': 'Kết Quả Phân Tích',
    'candidate_pipelin.pdf_viewer': 'Xem PDF CV',
    'candidate_pipelin.download_pdf': 'Tải PDF gốc',
    'candidate_pipelin.match_score_title': 'Điểm Phù Hợp',
    'candidate_pipelin.match_label': 'Khớp',
    'candidate_pipelin.score_explanation': 'Dựa trên các yêu cầu của JD',
    'candidate_pipelin.must_have': 'Bắt buộc:',
    'candidate_pipelin.nice_to_have': 'Ưu tiên:',
    'candidate_pipelin.keywords_title': 'Từ khóa phù hợp',
    'candidate_pipelin.radar_title': 'Đánh giá kỹ năng',
    'candidate_pipelin.gen_assessment': 'Đánh giá chung',
    'candidate_pipelin.fit_gap_title': 'Phân tích chi tiết',
    'candidate_pipelin.table_req': 'Yêu cầu công việc (JD)',
    'candidate_pipelin.table_evidence': 'Bằng chứng trong CV',
    'candidate_pipelin.table_status': 'Trạng thái',
    'candidate_pipelin.status_matched': 'Đạt',
    'candidate_pipelin.status_missing': 'Thiếu',
    'candidate_pipelin.strengths': 'Điểm mạnh',
    'candidate_pipelin.weaknesses': 'Điểm yếu / Kỹ năng thiếu',
    'candidate_pipelin.interview_q': 'Câu hỏi phỏng vấn đề xuất',
    'candidate_pipelin.btn_print': 'In Báo Cáo',
    'candidate_pipelin.btn_send': 'Gửi Email',
    
    // Fit Gap Analysis (Tab 4/5)
    'compare.save_btn': 'Lưu kết quả',
    'compare.view_jd_btn': 'Xem JD',
    'compare.original_jd': 'Mô tả công việc gốc',
    'compare.save_modal_title': 'Lưu vào danh sách',
    'compare.confirm_save': 'Xác nhận lưu',
    'compare.no_analysis_title': 'Chưa có phân tích nào',
    'compare.no_analysis_description': 'Vui lòng vào tab "Phân tích mới" và chạy phân tích để xem kết quả tại đây.'
  }
};

const ApplicationContext = createContext(undefined);

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/api/applications`;

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [language, setLanguageState] = useState('en');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null);
  const [lastJdSource, setLastJdSource] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('app_lang') || 'en';
    setLanguageState(stored);
    fetchApplications();
  }, []);

  const t = (key) => {
    return (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || key;
  };

  const mapApp = (item) => ({
    id: item.id?.toString?.() ?? String(item.id),
    companyName: item.company_name || item.companyName || '',
    jobTitle: item.job_title || item.jobTitle || '',
    status: item.status || 'new',
    matchScore: item.match_score ?? item.matchScore ?? 0,
    dateApplied: item.created_at 
      ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : (item.dateApplied || 'N/A'),    analysisResult: item.analysis_result || item.analysisResult || null,
    jdContent: item.jd_content || '', 
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company_name || item.companyName || '')}&background=random`
  });

  const fetchApplications = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map(mapApp) : [];
      setApplications(mapped);
      setTotalAnalyses(mapped.length + 120);
    } catch (err) {
      console.error('fetchApplications error:', err);
    }
  };

  const addNotification = (title, message) => {
    const newNotif = {
        id: Date.now(),
        title: title,
        message: message,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const runBackgroundAnalysis = async (file, jdText, jdId) => {
    setIsAnalyzing(true);
    setAnalysisSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      if (jdId) {
        formData.append("jd_id", jdId);
      } else {
        formData.append("jd_text", jdText);
      }

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || response.statusText);
      }

      const result = await response.json();
      
      setLastAnalysisResult(result);
      setLastJdSource({
         type: jdId ? 'library' : 'manual',
         id: jdId,
         content: jdText
      });

      incrementAnalysisCount();
      setIsAnalyzing(false);
      setAnalysisSuccess(true);

      const cName = result.personal_info?.name || "Unknown";
      const cPos = result.personal_info?.position || "N/A";
      const cScore = result.matching_score?.percentage || 0;
      
      addNotification("Analysis Complete", `${cName} • ${cPos} • ${cScore}% Match`);

      setTimeout(() => {
        setAnalysisSuccess(false);
      }, 3000);

      return result;

    } catch (error) {
      console.error("Background Analysis Failed:", error);
      setIsAnalyzing(false);
      
      // --- TRIGGER NOTIFICATION KHI LỖI ---
      addNotification("Analysis Failed", error.message || "An error occurred during analysis.");
      // ------------------------------------
      
      alert("Phân tích thất bại: " + error.message);
      throw error;
    }
  };

  const addApplication = async (newApp) => {
    const payload = {
      company_name: newApp.companyName,
      job_title: newApp.jobTitle,
      status: newApp.status || 'new',
      match_score: newApp.matchScore ?? 0,
      analysis_result: newApp.analysisResult ?? null,
      jd_content: newApp.jdContent || '' 
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        const mapped = mapApp(created);
        setApplications(prev => [mapped, ...prev]);
        incrementAnalysisCount();
        
        addNotification("Application Saved", `Saved "${newApp.jobTitle}" to your pipeline.`);
        
        return mapped;
      } else {
        const txt = await res.text();
        console.error('addApplication failed:', txt);
      }
    } catch (err) {
      console.error('addApplication error:', err);
    }
  };

  const updateApplication = async (id, updates) => {
    try {
      const payload = {};
      if (updates.status) payload.status = updates.status;
      if (updates.jobTitle) payload.job_title = updates.jobTitle;
      if (updates.companyName) payload.company_name = updates.companyName;

      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setApplications(prev => prev.map(a => (a.id === String(id) ? mapApp(updated) : a)));
        return updated;
      } else {
        console.error('updateApplication failed');
      }
    } catch (err) {
      console.error('updateApplication error:', err);
    }
  };

  const moveApplication = async (id, newStatus) => {
    return updateApplication(id, { status: newStatus });
  };

  const deleteApplication = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== String(id)));
      } else {
        console.error('deleteApplication failed');
      }
    } catch (err) {
      console.error('deleteApplication error:', err);
    }
  };

  const incrementAnalysisCount = () => setTotalAnalyses(prev => prev + 1);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_lang', lang);
    } catch (e) {
      console.warn('localStorage set failed', e);
    }
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      totalAnalyses,
      language,
      setLanguage,
      t,
      addApplication,
      moveApplication,
      updateApplication,
      deleteApplication,
      incrementAnalysisCount,
      fetchApplications,
      
      isAnalyzing,
      analysisSuccess,
      lastAnalysisResult,
      lastJdSource,
      runBackgroundAnalysis,

      // Export Notification Props
      notifications,
      unreadCount,
      markAllAsRead,
      removeNotification
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplicationContext must be used within a ApplicationProvider');
  }
  return context;
};