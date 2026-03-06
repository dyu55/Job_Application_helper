import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const applications = await db.all('SELECT * FROM applications ORDER BY applied_date DESC');

        // Parse JSON strings back to arrays before sending to client
        const parsedApps = applications.map(app => ({
            ...app,
            responsibilities: app.responsibilities ? JSON.parse(app.responsibilities) : [],
            requirements: app.requirements ? JSON.parse(app.requirements) : [],
            skills: app.skills ? JSON.parse(app.skills) : []
        }));

        return NextResponse.json(parsedApps);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { url, company_name, job_title, description, responsibilities, requirements, skills, category, status, applied_date } = data;

        const db = await getDb();
        const result = await db.run(
            `INSERT INTO applications (url, company_name, job_title, description, responsibilities, requirements, skills, category, status, applied_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                url,
                company_name,
                job_title,
                description,
                JSON.stringify(responsibilities || []),
                JSON.stringify(requirements || []),
                JSON.stringify(skills || []),
                category,
                status || 'Applied',
                applied_date || new Date().toISOString()
            ]
        );

        return NextResponse.json({ id: result.lastID }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
