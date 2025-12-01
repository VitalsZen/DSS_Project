// ...existing code...
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { useApplicationContext } from "../context/ApplicationContext";

export const Layout = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    t, 
    language, 
    setLanguage, 
    isAnalyzing, 
    analysisSuccess, 
    lastAnalysisResult,
    // Lấy state notification từ context
    notifications,
    unreadCount,
    markAllAsRead,
    removeNotification
  } = useApplicationContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
        markAllAsRead(); // Bấm vào là coi như đã đọc
    }
  };

  const navItems = [
    { id: 'dashboard', name: t('sidebar.dashboard'), icon: "dashboard", path: "/" },
    { id: 'pipeline', name: t('sidebar.pipeline'), icon: "view_kanban", path: "/pipeline" },
    { id: 'library', name: t('sidebar.library'), icon: "library_books", path: "/jd-library" },
    { id: 'analyze', name: t('sidebar.analyze'), icon: "search_check", path: "/jobs" },
    { id: 'compare', name: t('sidebar.compare'), icon: "compare_arrows", path: "/compare" },
    { id: 'stats', name: t('sidebar.stats'), icon: "bar_chart", path: "/reports" },
  ];

  const handleAnalyzeNow = () => {
    navigate('/jobs');
  };

  const renderIcon = (item, isActive) => {
    if (item.path === '/jobs' || item.id === 'analyze') {
      if (isAnalyzing) return <Icon name="sync" className="text-2xl animate-spin text-blue-500" />; 
      return <Icon name={item.icon} className="text-2xl animate-in fade-in zoom-in duration-300" fill={isActive} />;
    }
    if (item.path === '/compare' || item.id === 'compare') {
      if (analysisSuccess || lastAnalysisResult) return <Icon name="check_circle" className="text-2xl text-green-500 animate-in bounce-in duration-500" />;
    }
    return <Icon name={item.icon} className="text-2xl" fill={isActive} />;
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 shrink-0 z-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-2">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBV-XKFRahLav33uvvpRQw-YacJpdQYAGAxemtfd5FKajbq3qzYNJyLpE02oI_l-dgvMDDkx9k8B-p8Au8k2EWlyTaJHowaO9aZSZHNwGXdobCetOvFmVn0I86zvfMAB42WhkQasDv1671C5sZTUQfKyW2m8Qb7JLARuJzMmdAis9mJD_LKWsT56ry7dek9kJoRO3LsZtL8jPJTioqOE18nqoS8JGO5V_fQ_8PspuGKcjbfQKdvhjmg_8K5fxa-UvAsoF1sMTgDhIeS")',
              }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold">CareerFlow</h1>
              <p className="text-sm font-normal text-slate-500">Personal Tracker</p>
            </div>
          </div>

          <button
            onClick={handleAnalyzeNow}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 min-w-fit whitespace-nowrap"
          >
             {t('sidebar.analyze_now')}
          </button>

          <nav className="flex flex-col gap-2 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {renderIcon(item, isActive)}
                  <p className="text-sm font-medium whitespace-nowrap">{item.name}</p>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark px-6 py-4 bg-card-light dark:bg-card-dark shrink-0 z-10">
          <div className="flex items-center gap-4">
            {location.pathname.includes("/profile") ? (
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                    <Icon name="arrow_back" />
                </button>
            ) : null}
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          </div>
          
          <div className="flex flex-1 justify-end items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-card-light text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('vi')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'vi' ? 'bg-white dark:bg-card-light text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    VI
                </button>
            </div>

            <div className="h-6 w-px bg-border-light dark:bg-border-dark mx-1"></div>

            {/* NOTIFICATION BELL & DROPDOWN */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={handleToggleNotifications}
                    className="flex cursor-pointer items-center justify-center rounded-full size-10 text-slate-600 hover:bg-slate-100 transition-colors relative"
                >
                    <Icon name="notifications" className="text-2xl" />
                    {/* Badge đỏ hiện số lượng chưa đọc */}
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-card-dark animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown Menu */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && <span className="text-xs text-primary font-semibold">{unreadCount} new</span>}
                        </div>
                        
                        {/* SỬA: overflow-y-auto (dọc) và overflow-x-hidden (bỏ ngang) */}
                        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className="group relative p-4 border-b border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Remove"
                                        >
                                            <Icon name="close" className="text-sm" />
                                        </button>

                                        <div className="flex items-start gap-3 pr-4">
                                            <div className="mt-1.5 size-2 rounded-full bg-blue-500 shrink-0"></div>
                                            <div className="flex-1 min-w-0"> {/* min-w-0 giúp text wrap đúng */}
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{notif.title}</p>
                                                
                                                {/* SỬA: whitespace-normal (xuống dòng) và break-words (cắt từ nếu quá dài) */}
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-normal break-words leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                
                                                <p className="text-[10px] text-slate-400 mt-2">{notif.timestamp}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA-6BrU-8EvQq8eRkfJ-gku-LERn_HtP0jZjJlwiOhxn_nclGB2KNhq7HzSYdx2Srm8-oFtXDGebO7GpvR0ko7wn9MQ_dT6RtyacFkHa2M3j5qraA7vro3BjoOxmBuuqZflvaF6bPLeGcw5WGqLrHw03eikzehbTqlco-mcHU6LlYtVKAo6TWht7DgUfGxjm87FRVqAdRR_2hB3R17zEkhW2ifHO2Gweis2z5NlKJZLDyIPeGVW7_u-0zzdZP7nIDZ9B-Nt18gLqKeK")',
              }}
            ></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>

    
  );
};