/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { MainLayout } from './layouts/MainLayout.tsx';
import { Assessment } from './pages/Assessment.tsx';
import { AssessmentHub } from './pages/AssessmentHub.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { GamePlay } from './pages/GamePlay.tsx';
import { History } from './pages/History.tsx';
import { Landing } from './pages/Landing.tsx';
import { Login } from './pages/Login.tsx';
import { Profile } from './pages/Profile.tsx';
import { Register } from './pages/Register.tsx';
import { Results } from './pages/Results.tsx';
import { SkillGames } from './pages/SkillGames.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireCompleteProfile={false}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireCompleteProfile={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/assessment" element={<AssessmentHub />} />
            <Route
              path="/games"
              element={
                <ProtectedRoute requireCompleteProfile={true}>
                  <SkillGames />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/:gameType"
              element={
                <ProtectedRoute requireCompleteProfile={true}>
                  <GamePlay />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requireCompleteProfile={true}>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment/:track"
              element={
                <ProtectedRoute requireCompleteProfile={true}>
                  <Assessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:assessmentId"
              element={
                <ProtectedRoute requireCompleteProfile={true}>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
