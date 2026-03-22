import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes — no auth needed
  const publicPaths = ['/', '/client', '/login', '/signup', '/api'];
  if (publicPaths.some(p => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next();
  }
  
  // Dashboard requires auth — check for session cookie
  if (pathname.startsWith('/dashboard')) {
    // Check for Supabase auth cookie
    const supabaseCookie = request.cookies.getAll().find(c => c.name.includes('auth-token'));
    
    if (!supabaseCookie) {
      // No auth — redirect to login
      // But allow if Supabase is not configured yet (dev mode)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        // Supabase not configured — allow access in dev mode
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
