"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const server_1 = require("next/server");
const server_2 = require("@/lib/supabase/server");
async function DELETE(request, { params } // In Next.js 15+, params is a Promise
) {
    try {
        const supabase = await (0, server_2.createClient)();
        const { id } = await params;
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error deleting job:', error);
            return server_1.NextResponse.json({ error: error.message }, { status: 500 });
        }
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('API Error:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
