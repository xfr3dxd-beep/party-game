import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ImpostorePage from './games/impostore/ImpostorePage';
import SciaradaPage from './games/sciarada/SciaradaPage';
import TheMindPage from './games/the-mind/TheMindPage';
import PiliPiliPage from './games/pili-pili/PiliPiliPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/impostore"
            element={
              <ProtectedRoute>
                <ImpostorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sciarada"
            element={
              <ProtectedRoute>
                <SciaradaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/the-mind"
            element={
              <ProtectedRoute>
                <TheMindPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pili-pili"
            element={
              <ProtectedRoute>
                <PiliPiliPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
