import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Derive a safe filename
    const originalName = file.name || 'upload';
    const extFromName = originalName.includes('.') ? originalName.split('.').pop()?.toLowerCase() : undefined;
    const allowed = new Set(['jpg', 'jpeg', 'png', 'webp']);
    const ext = extFromName && allowed.has(extFromName) ? extFromName : 'png';
    const filename = `${crypto.randomUUID()}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
