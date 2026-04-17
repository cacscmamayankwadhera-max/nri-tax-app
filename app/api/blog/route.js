import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'content', 'blogs', `${slug}.md`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Strip frontmatter (between --- markers)
    const match = content.match(/^---[\s\S]*?---\s*/);
    const body = match ? content.slice(match[0].length).trim() : content.trim();

    return NextResponse.json(
      { content: body },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
    );
  } catch {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
}
