// frontend/src/context/JdContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const JdContext = createContext(undefined);

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:8000';
const JD_API = `${API_BASE}/api/jds`;

export const JdProvider = ({ children }) => {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJds();
  }, []);

  const mapJd = (item) => ({
    id: item.id?.toString?.() ?? String(item.id),
    title: item.title || 'Untitled',
    company: item.company || '',
    content: item.content || '',
    createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '-',
    updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString('vi-VN') : '-'
  });

  const fetchJds = async () => {
    setLoading(true);
    try {
      const res = await fetch(JD_API);
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
      const res = await fetch(JD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jd)
      });
      if (res.ok) {
        const created = await res.json();
        const mapped = mapJd(created);
        setJds(prev => [mapped, ...prev]);
        return true; // Trả về true để báo thành công
      }
    } catch (err) {
      console.error('addJd error:', err);
    }
    return false;
  };

  // --- HÀM UPDATE QUAN TRỌNG ---
  const updateJd = async (id, updates) => {
    try {
      console.log(`Sending PATCH to ${JD_API}/${id}`, updates);
      const res = await fetch(`${JD_API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const updatedItem = await res.json();
        const mapped = mapJd(updatedItem);
        // Cập nhật State ngay lập tức
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
      const res = await fetch(`${JD_API}/${id}`, { method: 'DELETE' });
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