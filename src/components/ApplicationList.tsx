"use client";
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function ApplicationList({ updateTrigger }: { updateTrigger: number }) {
    const [apps, setApps] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetch('/api/applications')
            .then(res => res.json())
            .then(data => setApps(data));
    }, [updateTrigger]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: number, currentCategory: string) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        setApps(apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
        try {
            await fetch(`/api/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, category: currentCategory })
            });
            window.dispatchEvent(new Event('app-updated'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this application?')) return;

        try {
            await fetch(`/api/applications/${id}`, {
                method: 'DELETE',
            });
            setApps(apps.filter(a => a.id !== id));
            window.dispatchEvent(new Event('app-updated'));
        } catch (error) {
            console.error('Failed to delete application', error);
        }
    };

    const filteredApps = apps.filter(app => {
        const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
        const matchesSearch = app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.company_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = filterDate === '' || app.applied_date.startsWith(filterDate);
        return matchesStatus && matchesSearch && matchesDate;
    });

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Recent Applications</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="search"
                        placeholder="Search jobs..."
                        className="input-field"
                        style={{ padding: '0.5rem', fontSize: '0.9rem', width: '200px' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <input
                        type="date"
                        className="input-field"
                        style={{ padding: '0.5rem', fontSize: '0.9rem', width: '150px' }}
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                    />
                    <select
                        className="input-field"
                        style={{ padding: '0.5rem', fontSize: '0.9rem', width: '130px' }}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>
            {filteredApps.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No matching applications found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredApps.map(app => (
                        <div key={app.id}
                            style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)', transition: 'transform 0.2s ease', cursor: 'pointer' }}
                            className="app-card"
                            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <h3 className="text-gradient" style={{ fontSize: '1.25rem' }}>{app.job_title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {new Date(app.applied_date).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, app.id)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s', padding: '0.25rem' }}
                                        title="Delete Application"
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{app.company_name} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>• {app.category}</span></p>

                            {expandedId !== app.id && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <select
                                        value={app.status || 'Applied'}
                                        onChange={e => handleStatusChange(e, app.id, app.category)}
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            background: app.status === 'Offer' ? '#10b98120' : app.status === 'Interview' ? '#8b5cf620' : app.status === 'Rejected' ? '#ef444420' : 'var(--bg-primary)',
                                            color: app.status === 'Offer' ? '#10b981' : app.status === 'Interview' ? '#8b5cf6' : app.status === 'Rejected' ? '#ef4444' : 'var(--text-primary)',
                                            border: `1px solid ${app.status === 'Offer' ? '#10b98150' : app.status === 'Interview' ? '#8b5cf650' : app.status === 'Rejected' ? '#ef444450' : 'var(--border-color)'}`,
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '500' }} onClick={e => e.stopPropagation()}>View Posting →</a>
                                </div>
                            )}

                            {expandedId === app.id && (
                                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', cursor: 'default' }} onClick={e => e.stopPropagation()}>

                                    {/* Responsibilities */}
                                    {app.responsibilities && app.responsibilities.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Responsibilities</h4>
                                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {app.responsibilities.map((req: string, i: number) => (
                                                    <li key={i}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Requirements */}
                                    {app.requirements && app.requirements.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Requirements</h4>
                                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {app.requirements.map((req: string, i: number) => (
                                                    <li key={i}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Skills & Technologies categorized */}
                                    {app.skills && Array.isArray(app.skills) && app.skills.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Skills & Technologies</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                                                {['Technology', 'Hard', 'Soft'].map(type => {
                                                    const filtered = app.skills.filter((s: any) => s.type === type || s.type === type + ' Skill');
                                                    if (filtered.length === 0) return null;
                                                    return (
                                                        <div key={type}>
                                                            <h5 style={{ color: type === 'Technology' ? '#8b5cf6' : type === 'Hard' ? '#3b82f6' : '#10b981', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                                {type === 'Technology' ? 'Technologies' : type + ' Skills'}
                                                            </h5>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                                {filtered.map((skill: any, i: number) => (
                                                                    <span key={i} style={{
                                                                        padding: '0.25rem 0.75rem',
                                                                        borderRadius: '1rem',
                                                                        fontSize: '0.8rem',
                                                                        border: '1px solid var(--border-color)',
                                                                        background: 'var(--bg-primary)',
                                                                        color: 'var(--text-primary)'
                                                                    }}>
                                                                        {skill.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                                        <select
                                            value={app.status || 'Applied'}
                                            onChange={e => handleStatusChange(e, app.id, app.category)}
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.8rem',
                                                background: app.status === 'Offer' ? '#10b98120' : app.status === 'Interview' ? '#8b5cf620' : app.status === 'Rejected' ? '#ef444420' : 'var(--bg-primary)',
                                                color: app.status === 'Offer' ? '#10b981' : app.status === 'Interview' ? '#8b5cf6' : app.status === 'Rejected' ? '#ef4444' : 'var(--text-primary)',
                                                border: `1px solid ${app.status === 'Offer' ? '#10b98150' : app.status === 'Interview' ? '#8b5cf650' : app.status === 'Rejected' ? '#ef444450' : 'var(--border-color)'}`,
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '500' }}>View Posting →</a>
                                    </div>

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
