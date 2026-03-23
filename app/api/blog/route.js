import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'content', 'blogs', `${slug}.md`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Strip frontmatter (between --- markers)
    const fmEnd = content.indexOf('---', 4);
    const body = fmEnd > 0 ? content.slice(fmEnd + 3).trim() : content;

    return NextResponse.json({ content: body });
  } catch {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
}
