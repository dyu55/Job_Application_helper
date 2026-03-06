"use client";
import { useState } from 'react';
import AddApplicationForm from '@/components/AddApplicationForm';
import DailyProgress from '@/components/DailyProgress';
import DashboardStats from '@/components/DashboardStats';
import ApplicationList from '@/components/ApplicationList';
import SettingsModal from '@/components/SettingsModal';
import { Settings } from 'lucide-react';

export default function Home() {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const refreshData = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Job Application Helper</h1>
        <button
          className="btn-primary"
          style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          onClick={() => setShowSettings(true)}
        >
          <Settings size={20} />
          Settings
        </button>
      </header>

      <DashboardStats updateTrigger={updateTrigger} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
        <aside>
          <DailyProgress updateTrigger={updateTrigger} />
        </aside>
        <section>
          <AddApplicationForm onAdd={refreshData} />
          <ApplicationList updateTrigger={updateTrigger} />
        </section>
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={() => { setShowSettings(false); refreshData(); }}
        />
      )}
    </main>
  );
}
