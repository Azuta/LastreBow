// src/app/api/plugins/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const { pluginId, action, pluginType } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (action === 'install') {
            if (pluginType === 'user' || pluginType === 'reader') {
                const { error } = await supabase.from('user_plugins').insert({
                    user_id: user.id,
                    plugin_id: pluginId,
                });
                if (error) throw error;
            } 
            // Lógica para instalar plugins de grupos
        } else if (action === 'uninstall') {
            if (pluginType === 'user' || pluginType === 'reader') {
                const { error } = await supabase.from('user_plugins').delete().eq('user_id', user.id).eq('plugin_id', pluginId);
                if (error) throw error;
            }
            // Lógica para desinstalar plugins de grupos
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error handling plugin action:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to update plugin status' }), { status: 500 });
    }
}