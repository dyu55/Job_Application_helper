"use client";
import { useEffect, useState } from 'react';
import { Briefcase, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

export default function DashboardStats({ updateTrigger }: { updateTrigger: number }) {
    const [stats, setStats] = useState({ total: 0, applied: 0, interviewing: 0, offers: 0, rejected: 0 });

    useEffect(() => {
        const loadStats = () => {
            fetch('/api/applications')
                .then(res => res.json())
                .then(data => {
                    const total = data.length;
                    const applied = data.filter((d: any) => d.status === 'Applied').length;
                    const interviewing = data.filter((d: any) => d.status === 'Interview').length;
                    const offers = data.filter((d: any) => d.status === 'Offer').length;
                    const rejected = data.filter((d: any) => d.status === 'Rejected').length;
                    setStats({ total, applied, interviewing, offers, rejected });
                });
        };

        loadStats();
        window.addEventListener('app-updated', loadStats);
        return () => window.removeEventListener('app-updated', loadStats);
    }, [updateTrigger]);

    const statCards = [
        { label: 'Total Tracked', value: stats.total, icon: Briefcase, color: '#3b82f6' },
        { label: 'Pending / Applied', value: stats.applied, icon: FileText, color: '#eab308' },
        { label: 'Interviews', value: stats.interviewing, icon: Clock, color: '#8b5cf6' },
        { label: 'Offers', value: stats.offers, icon: CheckCircle, color: '#10b981' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {statCards.map((s, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={28} color={s.color} style={{ marginBottom: '0.75rem' }} />
                    <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{s.value}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', textAlign: 'center' }}>{s.label}</p>
                </div>
            ))}
        </div>
    );
}
