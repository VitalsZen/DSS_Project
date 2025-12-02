// frontend/src/context/JdContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const JdContext = createContext(undefined);

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:8000';
const JD_API = `${API_BASE}/api/jds`;

// --- NEW: Helper lấy Session ID (Giống ApplicationContext) ---
const getSessionId = () => {
    let id = localStorage.getItem('careerflow_session_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('careerflow_session_id', id);
    }
    return id;
};

export const JdProvider = ({ children }) => {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJds();
  }, []);

const formatVNTime = (dateString) => {
      if (!dateString) return '-';
      let utcString = dateString;
      if (!utcString.endsWith('Z')) utcString += 'Z';
      try {
          return new Date(utcString).toLocaleString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
          });
      } catch (e) { return dateString; }
  };

  const mapJd = (item) => ({
    id: item.id?.toString?.() ?? String(item.id),
    title: item.title || 'Untitled',
    company: item.company || '',
    content: item.content || '',
    // Áp dụng hàm format mới
    createdAt: formatVNTime(item.created_at),
    updatedAt: formatVNTime(item.updated_at)
  });

  const fetchJds = async () => {
    setLoading(true);
    try {
      // --- CHANGE: Thêm Header ---
      const res = await fetch(JD_API, {
          headers: {
              'x-session-id': getSessionId()
          }
      });
      if (!res.ok) throw new Error('Failed to load JDs');
      const data = await res.json();
      setJds(Array.isArray(data) ? data.map(mapJd) : []);
    } catch (err) {
      console.error('fetchJds error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addJd = async (jd) => {
    try {
      // --- CHANGE: Thêm Header ---
      const res = await fetch(JD_API, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': getSessionId()
        },
        body: JSON.stringify(jd)
      });
      if (res.ok) {
        const created = await res.json();
        const mapped = mapJd(created);
        setJds(prev => [mapped, ...prev]);
        return true; 
      }
    } catch (err) {
      console.error('addJd error:', err);
    }
    return false;
  };

  const updateJd = async (id, updates) => {
    try {
      console.log(`Sending PATCH to ${JD_API}/${id}`, updates);
      // --- CHANGE: Thêm Header ---
      const res = await fetch(`${JD_API}/${id}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': getSessionId()
        },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const updatedItem = await res.json();
        const mapped = mapJd(updatedItem);
        setJds(prev => prev.map(jd => jd.id === String(id) ? mapped : jd));
        return true;
      } else {
        const errText = await res.text();
        console.error('Update failed:', errText);
        alert('Update failed: ' + errText);
      }
    } catch (err) {
      console.error('updateJd error:', err);
      alert('Network error when updating');
    }
    return false;
  };

  const deleteJd = async (id) => {
    try {
      // --- CHANGE: Thêm Header ---
      const res = await fetch(`${JD_API}/${id}`, { 
          method: 'DELETE',
          headers: {
              'x-session-id': getSessionId()
          }
      });
      if (res.ok) {
        setJds(prev => prev.filter(j => j.id !== String(id)));
      }
    } catch (err) {
      console.error('deleteJd error:', err);
    }
  };

  return (
    <JdContext.Provider value={{ jds, loading, fetchJds, addJd, updateJd, deleteJd }}>
      {children}
    </JdContext.Provider>
  );
};

export const useJdContext = () => {
  const ctx = useContext(JdContext);
  if (!ctx) throw new Error('useJdContext must be used within a JdProvider');
  return ctx;
};
