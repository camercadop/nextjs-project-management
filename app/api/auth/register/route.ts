import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body || {};

        if (!email || !password) {
            return NextResponse.json({ error: { code: 'auth.required_fields' } }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: { code: 'auth.password_too_short' } },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json({ error: { code: 'auth.email_in_use' } }, { status: 400 });
        }

        const hashed = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email: email.toLowerCase(), hashedPassword: hashed },
            select: { id: true, email: true },
        });

        return NextResponse.json({ ok: true, user }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: { code: 'server.error' } }, { status: 500 });
    }
}
