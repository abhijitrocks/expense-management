
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GroupPage from './pages/GroupPage';
import { useAppStore } from './store/useAppStore';
import Onboarding from './components/Onboarding';

function App() {
  const { user, init } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!user) {
    return <Onboarding />;
  }

  return (
    <HashRouter>
      <div className="max-w-4xl mx-auto font-sans antialiased">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/group/:id" element={<GroupPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
