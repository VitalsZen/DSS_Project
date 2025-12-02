import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TỪ ĐIỂN ĐA NGÔN NGỮ (CẢI TIẾN) ---
const TRANSLATIONS = {
  en: {
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.pipeline': 'My Applications',
    'sidebar.library': 'JD Library',
    'sidebar.analyze': 'Analyze New Job',
    'sidebar.compare': 'Analysis Result',
    'sidebar.stats': 'Stats & Insights',
    'sidebar.analyze_now': 'Analyze Now',

    // Dashboard
    'dashboard.analyses': 'Total Analyses',
    'dashboard.applications': 'Saved Applications',
    'dashboard.saved_jds': 'Saved JDs',
    'dashboard.perfect_matches': 'High Match (>90%)',
    'dashboard.activity': 'Activity Log',
    'dashboard.activity_sub': 'History over the last 30 days',
    'dashboard.recent': 'Recent Applications',
    'dashboard.view_all': 'View All',
    'dashboard.no_apps': 'No applications found. Start by analyzing a new job!',
    'dashboard.table.company': 'Company',
    'dashboard.table.role': 'Position',
    'dashboard.table.date': 'Date',
    'dashboard.table.status': 'Status',
    'dashboard.table.score': 'Match %',

    // Pipeline
    'pipeline.search_placeholder': 'Search by Job or Company...',
    'pipeline.status_all': 'All Status',
    'pipeline.new_btn': 'New Analysis',
    'pipeline.table_header_job': 'Job Position',
    'pipeline.table_header_actions': 'Actions',
    'pipeline.no_data': 'No records found matching your filters.',
    'pipeline.records': 'records',
    'pipeline.data_corrupted': 'Data unavailable.',
    'pipeline.source_text': 'Source Content',
    
    // Status Labels
    'status.Wishlist': 'Wishlist',
    'status.Applied': 'Applied',
    'status.Interviewing': 'Interviewing',
    'status.Offer Received': 'Offer Received',
    'status.Rejected': 'Rejected',

    // Notifications
    'notif.title': 'Notifications',
    'notif.empty': 'No notifications yet.',
    'notif.new_badge': 'new',
    'notif.analysis_success_title': 'Analysis Complete',
    'notif.analysis_failed_title': 'Analysis Failed',
    'notif.app_saved_title': 'Application Saved',
    'notif.app_saved_msg': 'Successfully added to your pipeline.',
    'notif.generic_error': 'An error occurred.',

    // Delete Modal
    'modal.delete_title': 'Delete Record?',
    'modal.delete_confirm': 'Are you sure you want to delete this record?',
    'modal.delete_warning': 'This action cannot be undone.',
    'modal.btn_cancel': 'Cancel',
    'modal.btn_confirm': 'Delete',

    // JD Library
    'library.title': 'Job Description Library',
    'library.subtitle': 'Manage your saved JDs for quick reuse.',
    'library.add_btn': 'Add New JD',
    'library.table_job': 'Job Title',
    'library.table_company': 'Company',
    'library.table_added': 'Date Added',
    'library.table_updated': 'Last Updated',
    'library.drawer_create': 'Create New JD',
    'library.drawer_edit': 'Edit JD',
    'library.drawer_view': 'JD Details',
    'library.readonly_view': 'Read-only Mode',
    'library.fill_details': 'Enter JD details below',
    'library.form_title': 'Job Title',
    'library.form_company': 'Company Name',
    'library.form_content': 'Job Description Content',
    'library.btn_cancel': 'Cancel',
    'library.btn_create': 'Create',
    'library.btn_save': 'Save Changes',
    'library.btn_edit': 'Edit',
    'library.btn_delete': 'Delete',
    'library.no_jds': 'No JDs found. Add one to get started!',
    'library.validation_error': 'Title and Content are required.',

    // Analyze New Job
    'analyze.title': 'Instant Fit Check',
    'analyze.subtitle': 'Compare your CV against any Job Description instantly.',
    'analyze.active_cv': 'Active Resume',
    'analyze.no_file': 'No PDF selected',
    'analyze.change_pdf': 'Change PDF',
    'analyze.import_pdf': 'Upload PDF',
    'analyze.jd_source': 'Job Description Source',
    'analyze.select_placeholder': '-- Paste text or Select saved JD --',
    'analyze.manual_placeholder': 'Paste the full Job Description text here...',
    'analyze.locked': 'Locked (Using Saved JD)',
    'analyze.btn_run': 'Run Analysis',
    'analyze.btn_analyzing': 'Analyzing...',
    'analyze.error_upload': 'Please upload your CV (PDF) first.',
    'analyze.error_jd': 'Please provide a Job Description.',

    // Result View
    'result.overall_score': 'Overall Match Score',
    'result.confidence': 'AI Confidence',
    'result.must_have': 'Must Have',
    'result.nice_to_have': 'Nice to Have',
    'result.radar_chart': 'Competency Radar',
    'result.matched_keywords': 'Matched Keywords',
    'result.ai_assessment': 'AI Executive Summary',
    'result.detailed_comparison': 'Detailed Comparison',
    'result.table.req': 'Job Requirement',
    'result.table.ev': 'Your Evidence',
    'result.table.status': 'Status',
    'result.strengths': 'Key Strengths',
    'result.weaknesses': 'Missing Skills / Gaps',
    'result.interview_questions': 'Interview Prep Questions',
    'result.btn_why_score': 'Why this score?',
    'result.btn_close_details': 'Close Details',
    'result.drawer_title': 'Detailed Scoring Reasoning',

    // Compare Page
    'compare.save_btn': 'Save Result',
    'compare.view_jd_btn': 'View Original JD',
    'compare.original_jd': 'Original Job Description',
    'compare.save_modal_title': 'Save to Pipeline',
    'compare.confirm_save': 'Confirm & Save',
    'compare.no_analysis_title': 'No Analysis Data',
    'compare.no_analysis_description': 'Go to "Analyze New Job" to run your first analysis.'
  },
  vi: {
    // Sidebar
    'sidebar.dashboard': 'Tổng Quan',
    'sidebar.pipeline': 'Danh Sách Hồ Sơ',
    'sidebar.library': 'Kho JD',
    'sidebar.analyze': 'Phân Tích Mới',
    'sidebar.compare': 'Kết Quả Chi Tiết',
    'sidebar.stats': 'Báo Cáo',
    'sidebar.analyze_now': 'Phân tích ngay',

    // Dashboard
    'dashboard.analyses': 'Lượt phân tích',
    'dashboard.applications': 'Hồ sơ đã lưu',
    'dashboard.saved_jds': 'JD trong kho',
    'dashboard.perfect_matches': 'Độ khớp cao (>90%)',
    'dashboard.activity': 'Hoạt động gần đây',
    'dashboard.activity_sub': 'Thống kê trong 30 ngày qua',
    'dashboard.recent': 'Hồ sơ mới nhất',
    'dashboard.view_all': 'Xem tất cả',
    'dashboard.no_apps': 'Chưa có dữ liệu. Hãy thử phân tích công việc đầu tiên!',
    'dashboard.table.company': 'Công ty',
    'dashboard.table.role': 'Vị trí',
    'dashboard.table.date': 'Ngày tạo',
    'dashboard.table.status': 'Trạng thái',
    'dashboard.table.score': 'Độ phù hợp',

    // Pipeline
    'pipeline.search_placeholder': 'Tìm theo Vị trí hoặc Công ty...',
    'pipeline.status_all': 'Tất cả trạng thái',
    'pipeline.new_btn': 'Thêm phân tích',
    'pipeline.table_header_job': 'Vị trí ứng tuyển',
    'pipeline.table_header_actions': 'Thao tác',
    'pipeline.no_data': 'Không tìm thấy hồ sơ nào.',
    'pipeline.records': 'bản ghi',
    'pipeline.data_corrupted': 'Dữ liệu không khả dụng.',
    'pipeline.source_text': 'Nội dung gốc',
    
    // Status Labels
    'status.Wishlist': 'Quan tâm',
    'status.Applied': 'Đã nộp CV',
    'status.Interviewing': 'Đang phỏng vấn',
    'status.Offer Received': 'Đã nhận Offer',
    'status.Rejected': 'Bị từ chối',

    // Notifications
    'notif.title': 'Thông báo',
    'notif.empty': 'Chưa có thông báo nào.',
    'notif.new_badge': 'mới',
    'notif.analysis_success_title': 'Phân tích hoàn tất',
    'notif.analysis_failed_title': 'Phân tích thất bại',
    'notif.app_saved_title': 'Đã lưu hồ sơ',
    'notif.app_saved_msg': 'Hồ sơ đã được thêm vào danh sách theo dõi.',
    'notif.generic_error': 'Đã có lỗi xảy ra.',

    // Delete Modal
    'modal.delete_title': 'Xóa dữ liệu?',
    'modal.delete_confirm': 'Bạn có chắc chắn muốn xóa bản ghi này?',
    'modal.delete_warning': 'Dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.',
    'modal.btn_cancel': 'Hủy bỏ',
    'modal.btn_confirm': 'Xóa ngay',

    // JD Library
    'library.title': 'Kho Job Description (JD)',
    'library.subtitle': 'Lưu trữ các mô tả công việc để tái sử dụng.',
    'library.add_btn': 'Thêm JD Mới',
    'library.table_job': 'Tên công việc',
    'library.table_company': 'Công ty',
    'library.table_added': 'Ngày thêm',
    'library.table_updated': 'Cập nhật',
    'library.drawer_create': 'Tạo JD Mới',
    'library.drawer_edit': 'Chỉnh sửa JD',
    'library.drawer_view': 'Chi tiết JD',
    'library.readonly_view': 'Chế độ xem',
    'library.fill_details': 'Nhập thông tin bên dưới',
    'library.form_title': 'Tên công việc',
    'library.form_company': 'Tên công ty',
    'library.form_content': 'Nội dung mô tả (JD)',
    'library.btn_cancel': 'Hủy',
    'library.btn_create': 'Tạo mới',
    'library.btn_save': 'Lưu thay đổi',
    'library.btn_edit': 'Sửa',
    'library.btn_delete': 'Xóa',
    'library.no_jds': 'Danh sách trống. Hãy thêm JD đầu tiên!',
    'library.validation_error': 'Vui lòng nhập Tiêu đề và Nội dung.',

    // Analyze New Job
    'analyze.title': 'Kiểm tra độ phù hợp',
    'analyze.subtitle': 'So sánh CV của bạn với bất kỳ mô tả công việc nào chỉ trong vài giây.',
    'analyze.active_cv': 'CV Đang dùng',
    'analyze.no_file': 'Chưa chọn PDF',
    'analyze.change_pdf': 'Đổi CV',
    'analyze.import_pdf': 'Tải lên CV',
    'analyze.jd_source': 'Nguồn dữ liệu JD',
    'analyze.select_placeholder': '-- Dán văn bản hoặc Chọn từ kho --',
    'analyze.manual_placeholder': 'Copy và dán toàn bộ nội dung tuyển dụng vào đây...',
    'analyze.locked': 'Đã khóa (JD từ kho)',
    'analyze.btn_run': 'Bắt đầu phân tích',
    'analyze.btn_analyzing': 'AI đang đọc...',
    'analyze.error_upload': 'Vui lòng tải lên CV (định dạng PDF).',
    'analyze.error_jd': 'Vui lòng nhập hoặc chọn một mô tả công việc.',

    // Result View
    'result.overall_score': 'Điểm phù hợp',
    'result.confidence': 'Độ tin cậy',
    'result.must_have': 'Yêu cầu Bắt buộc',
    'result.nice_to_have': 'Điểm cộng (Ưu tiên)',
    'result.radar_chart': 'Biểu đồ năng lực',
    'result.matched_keywords': 'Từ khóa khớp',
    'result.ai_assessment': 'Nhận xét tổng quan từ AI',
    'result.detailed_comparison': 'So sánh chi tiết từng mục',
    'result.table.req': 'Yêu cầu của nhà tuyển dụng',
    'result.table.ev': 'Năng lực trong CV của bạn',
    'result.table.status': 'Kết quả',
    'result.strengths': 'Điểm mạnh nổi bật',
    'result.weaknesses': 'Điểm yếu & Kỹ năng thiếu',
    'result.interview_questions': 'Gợi ý câu hỏi phỏng vấn',
    'result.btn_why_score': 'Tại sao có điểm này?',
    'result.btn_close_details': 'Đóng chi tiết',
    'result.drawer_title': 'Giải thích chi tiết điểm số',

    // Compare Page
    'compare.save_btn': 'Lưu kết quả',
    'compare.view_jd_btn': 'Xem JD gốc',
    'compare.original_jd': 'Nội dung JD gốc',
    'compare.save_modal_title': 'Lưu vào danh sách theo dõi',
    'compare.confirm_save': 'Xác nhận lưu',
    'compare.no_analysis_title': 'Chưa có dữ liệu phân tích',
    'compare.no_analysis_description': 'Vui lòng truy cập tab "Phân tích mới" để thực hiện kiểm tra.'
  }
};

const ApplicationContext = createContext(undefined);

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/api/applications`;

const getSessionId = () => {
    let id = localStorage.getItem('careerflow_session_id');
    if (!id) {
        id = crypto.randomUUID(); 
        localStorage.setItem('careerflow_session_id', id);
    }
    return id;
};

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

  const mapApp = (item) => {
    let formattedDate = 'N/A';
    if (item.created_at) {
        let utcString = item.created_at;
        if (!utcString.endsWith('Z')) {
            utcString += 'Z';
        }
        try {
            formattedDate = new Date(utcString).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (e) {
            formattedDate = item.created_at;
        }
    }

    return {
      id: item.id?.toString?.() ?? String(item.id),
      companyName: item.company_name || item.companyName || '',
      jobTitle: item.job_title || item.jobTitle || '',
      status: item.status || 'new',
      matchScore: item.match_score ?? item.matchScore ?? 0,
      dateApplied: formattedDate,
      analysisResult: item.analysis_result || item.analysisResult || null,
      jdContent: item.jd_content || '', 
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company_name || item.companyName || '')}&background=random`
    };
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(API_URL, {
          headers: { 'x-session-id': getSessionId() }
      });
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
        headers: { 'x-session-id': getSessionId() },
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
      const cScore = result.matching_score?.percentage || 0;
      
      addNotification(t('notif.analysis_success_title'), `${cName} • ${cScore}% Match`);

      setTimeout(() => {
        setAnalysisSuccess(false);
      }, 3000);

      return result;

    } catch (error) {
      console.error("Background Analysis Failed:", error);
      setIsAnalyzing(false);
      addNotification(t('notif.analysis_failed_title'), error.message || t('notif.generic_error'));
      alert(`${t('notif.analysis_failed_title')}: ${error.message}`);
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
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': getSessionId() 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        const mapped = mapApp(created);
        setApplications(prev => [mapped, ...prev]);
        incrementAnalysisCount();
        
        addNotification(t('notif.app_saved_title'), t('notif.app_saved_msg'));
        
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
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': getSessionId()
        },
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

  const deleteApplication = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE',
          headers: { 'x-session-id': getSessionId() }
      });
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
      updateApplication,
      deleteApplication,
      incrementAnalysisCount,
      fetchApplications,
      isAnalyzing,
      analysisSuccess,
      lastAnalysisResult,
      lastJdSource,
      runBackgroundAnalysis,
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
