import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const goalRow = await db.get(`SELECT value FROM settings WHERE key = 'daily_goal'`);
        return NextResponse.json({ daily_goal: goalRow ? parseInt(goalRow.value, 10) : 10 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { daily_goal } = data;

        if (typeof daily_goal !== 'number' || daily_goal < 1) {
            return NextResponse.json({ error: 'Invalid daily goal' }, { status: 400 });
        }

        const db = await getDb();
        await db.run(
            `INSERT INTO settings (key, value) VALUES ('daily_goal', ?) 
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [daily_goal.toString()]
        );

        return NextResponse.json({ success: true, daily_goal });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
