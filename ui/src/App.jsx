import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './HomeScreen.jsx';
import PlayerScreen from './PlayerScreen.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/player/:id" element={<PlayerScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
