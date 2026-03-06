"use client";
import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function AddApplicationForm({ onAdd }: { onAdd: () => void }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [details, setDetails] = useState<any>(null);

    const handleScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to extract data');

            setDetails({ ...data, url });
            setShowDetails(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...details, applied_date: new Date().toISOString() }),
            });
            if (!res.ok) throw new Error('Failed to save');

            setUrl('');
            setShowDetails(false);
            setDetails(null);
            onAdd();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Add New Application</h2>
            {!showDetails ? (
                <form onSubmit={handleScrape} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="url"
                        className="input-field"
                        placeholder="Paste Job Description URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <><PlusCircle size={20} /> Auto Fill</>}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input className="input-field" value={details.company_name} onChange={e => setDetails({ ...details, company_name: e.target.value })} placeholder="Company Name" required />
                        <input className="input-field" value={details.job_title} onChange={e => setDetails({ ...details, job_title: e.target.value })} placeholder="Job Title" required />
                    </div>
                    <input className="input-field" value={details.category} onChange={e => setDetails({ ...details, category: e.target.value })} placeholder="Category (e.g. Software, Data)" />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Responsibilities</label>
                        <textarea className="input-field" value={details.responsibilities?.join('\n') || ''} onChange={e => setDetails({ ...details, responsibilities: e.target.value.split('\n') })} placeholder="Responsibilities..." rows={4}></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Requirements</label>
                        <textarea className="input-field" value={details.requirements?.join('\n') || ''} onChange={e => setDetails({ ...details, requirements: e.target.value.split('\n') })} placeholder="Requirements..." rows={4}></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Summary / Description</label>
                        <textarea className="input-field" value={details.description} onChange={e => setDetails({ ...details, description: e.target.value })} placeholder="Description snippet..." rows={3}></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" className="btn-primary" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setShowDetails(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Save Application'}
                        </button>
                    </div>
                </form>
            )}
            {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
}
