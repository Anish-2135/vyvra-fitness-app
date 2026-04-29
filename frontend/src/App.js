// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login     from './pages/Login';
import Signup    from './pages/Signup';
import Dashboard from './pages/Dashboard';
import History   from './pages/History';
import Profile   from './pages/Profile';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;