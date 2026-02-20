import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { mediaQueue } from '@/lib/queue/client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication (Optional for now)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use the real user ID if logged in, otherwise use a dummy ID
    // 00000000-0000-0000-0000-000000000000 is the nil UUID
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const body = await request.json();
    const { type, sourceUrl, metadata } = body;

    if (!type || !sourceUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create Job in Supabase
    const { data: job, error: dbError } = await supabase
      .from('jobs')
      .insert({
        type,
        source_url: sourceUrl,
        metadata: metadata || {},
        status: 'PENDING',
        user_id: userId === '00000000-0000-0000-0000-000000000000' ? null : userId
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to create job record' }, { status: 500 });
    }

    // 2. Add to BullMQ
    await mediaQueue.add(type === 'MAGNET' ? 'download_torrent' : 'download_direct', {
      jobId: job.id,
      sourceUrl,
      type,
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
