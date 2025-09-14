export default {
  async fetch(request, env) {
    const cookieHeader = request.headers.get('cookie') || '';
    let deviceId = null;

    // Revisar si ya hay cookie
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const deviceCookie = cookies.find(c => c.startsWith('deviceId='));
    if (deviceCookie) {
      deviceId = deviceCookie.split('=')[1];
    }

    // Si no hay deviceId, crear uno nuevo
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      // Guardar el nuevo deviceId en KV
      await env.VISITAS.put(deviceId, '1', { expirationTtl: 30 * 24 * 60 * 60 }); // expira en 30 días
    } else {
      // Guardar la IP también para seguridad (opcional)
      await env.VISITAS.put(deviceId, '1', { expirationTtl: 30 * 24 * 60 * 60 });
    }

    // Contar todas las visitas únicas
    const keys = await env.VISITAS.list();
    const visitas = keys.keys.length;

    // Preparar cookie para enviar al navegador
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `deviceId=${deviceId}; Max-Age=${30 * 24 * 60 * 60}; Path=/; HttpOnly; Secure; SameSite=Lax`
    });

    return new Response(JSON.stringify({ visitas }), { headers });
  }
}
