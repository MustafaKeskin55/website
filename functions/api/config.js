export async function onRequest(context) {
    const { request, env } = context;

    // CORS Headers for API
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    try {
        // GET Request: Anyone (or the Android app) can read the config
        if (request.method === 'GET') {
            const configStr = await env.CONFIG.get('app_settings');
            const config = configStr ? JSON.parse(configStr) : { adsEnabled: true, ramazanMode: false };
            return new Response(JSON.stringify(config), { headers });
        }

        // POST Request: Only Admin can save config
        if (request.method === 'POST') {
            const authHeader = request.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
            }

            const token = authHeader.split(' ')[1];

            // Verify JWT via Google's official endpoint (Ultra Secure)
            const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            if (!googleRes.ok) {
                return new Response(JSON.stringify({ error: 'Invalid Google Token' }), { status: 401, headers });
            }

            const payload = await googleRes.json();

            // Check if the email matches the Admin
            if (payload.email !== 'mustafakeksinn@gmail.com') {
                return new Response(JSON.stringify({ error: 'Forbidden: You are not the admin' }), { status: 403, headers });
            }

            // If we reach here, it's 100% Mustafa Keskin. Save the data!
            const body = await request.json();
            
            const newConfig = {
                adsEnabled: body.adsEnabled !== undefined ? body.adsEnabled : true,
                ramazanMode: body.ramazanMode !== undefined ? body.ramazanMode : false
            };

            await env.CONFIG.put('app_settings', JSON.stringify(newConfig));

            return new Response(JSON.stringify({ success: true, config: newConfig }), { headers });
        }

        return new Response('Method Not Allowed', { status: 405, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}