import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const db = await getDb();

        await db.run('DELETE FROM applications WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const data = await request.json();

        const db = await getDb();

        const updates = [];
        const values = [];

        if (data.status) {
            updates.push('status = ?');
            values.push(data.status);
        }
        if (data.category) {
            updates.push('category = ?');
            values.push(data.category);
        }

        if (updates.length > 0) {
            values.push(id);
            await db.run(
                `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
