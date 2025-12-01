
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { JobManagement } from './pages/JobManagement';
import { CandidatePipeline } from './pages/CandidatePipeline';
import { CandidateProfile } from './pages/CandidateProfile';
import { Reports } from './pages/Reports';
import { CompareCandidates } from './pages/CompareCandidates';
import { JdLibrary } from './pages/JdLibrary';
import { JdProvider } from './context/JdContext';
import { ApplicationProvider } from './context/ApplicationContext';

const App = () => {
  return (
    <JdProvider>
      <ApplicationProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jd-library" element={<JdLibrary />} />
            <Route path="/jobs" element={<JobManagement />} />
            <Route path="/pipeline" element={<CandidatePipeline />} />
            <Route path="/profile/:id" element={<CandidateProfile />} />
            <Route path="/profile" element={<CandidateProfile />} /> 
            <Route path="/reports" element={<Reports />} />
            <Route path="/compare" element={<CompareCandidates />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ApplicationProvider>
    </JdProvider>
  );
};

export default App;
