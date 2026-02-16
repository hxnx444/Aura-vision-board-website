import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VisionBoard from './pages/VisionBoard';
import MonthlyCalendar from './pages/MonthlyCalendar';
import YearlyRoadmap from './pages/YearlyRoadmap';
import YearlyCalendar from './pages/YearlyCalendar';
import Layout from './components/Layout';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/vision/:id?" element={
        <PrivateRoute>
          <Layout>
            <VisionBoard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/monthly-calendar" element={
        <PrivateRoute>
          <Layout>
            <MonthlyCalendar />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/yearly-roadmap" element={
        <PrivateRoute>
          <Layout>
            <YearlyRoadmap />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/yearly-calendar" element={
        <PrivateRoute>
          <Layout>
            <YearlyCalendar />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
