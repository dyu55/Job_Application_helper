"use client";
import { useEffect, useState } from 'react';

export default function DailyProgress({ updateTrigger }: { updateTrigger: number }) {
    const [goal, setGoal] = useState(10);
    const [appliedToday, setAppliedToday] = useState(0);

    useEffect(() => {
        const loadProgress = () => {
            Promise.all([
                fetch('/api/goal').then(res => res.json()),
                fetch('/api/applications').then(res => res.json())
            ]).then(([goalData, appsData]) => {
                setGoal(goalData.daily_goal || 10);

                const today = new Date().toISOString().split('T')[0];
                const count = appsData.filter((app: any) => app.applied_date.startsWith(today)).length;
                setAppliedToday(count);
            });
        };

        loadProgress();
        window.addEventListener('app-updated', loadProgress);
        return () => window.removeEventListener('app-updated', loadProgress);
    }, [updateTrigger]);

    const progress = Math.min((appliedToday / goal) * 100, 100);

    return (
        <div className="glass-panel" style={{ textAlign: 'center', height: '100%' }}>
            <h2>Daily Progress</h2>
            <div style={{ margin: '2rem 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '150px', height: '150px' }}>
                    <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--bg-secondary)"
                        strokeWidth="3"
                    />
                    <path
                        className="circle"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                    <text x="18" y="20.5" textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--text-primary)', fontWeight: 'bold' }}>
                        {appliedToday} / {goal}
                    </text>
                </svg>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Job Applications</p>
            {progress >= 100 && <p style={{ color: '#10b981', marginTop: '1rem', fontWeight: 'bold' }}>🎉 Daily Goal Reached!</p>}
        </div>
    );
}
