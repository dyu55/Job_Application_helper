"use client";
import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function SettingsModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const [goal, setGoal] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/goal').then(res => res.json()).then(data => setGoal(data.daily_goal || 10));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ daily_goal: parseInt(goal.toString()) })
            });
            onSave();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Daily Application Goal</label>
                        <input type="number" min="1" className="input-field" value={goal} onChange={e => setGoal(parseInt(e.target.value))} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
