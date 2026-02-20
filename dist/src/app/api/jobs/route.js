"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const server_2 = require("@/lib/supabase/server");
const client_1 = require("@/lib/queue/client");
async function POST(request) {
    try {
        const supabase = await (0, server_2.createClient)();
        // Check authentication (Optional for now)
        const { data: { user } } = await supabase.auth.getUser();
        // Use the real user ID if logged in, otherwise use a dummy ID
        // 00000000-0000-0000-0000-000000000000 is the nil UUID
        const userId = user?.id || '00000000-0000-0000-0000-000000000000';
        const body = await request.json();
        const { type, sourceUrl, metadata } = body;
        if (!type || !sourceUrl) {
            return server_1.NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
            return server_1.NextResponse.json({ error: 'Failed to create job record' }, { status: 500 });
        }
        // 2. Add to BullMQ
        await client_1.mediaQueue.add(type === 'MAGNET' ? 'download_torrent' : 'download_direct', {
            jobId: job.id,
            sourceUrl,
            type,
        });
        return server_1.NextResponse.json({ success: true, job });
    }
    catch (error) {
        console.error('API Error:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
