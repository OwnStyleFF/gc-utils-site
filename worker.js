// Worker para contar visitantes únicos usando KV
export default {
  async fetch(request, env) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const visitasKey = "visitas_list";

    // Obtiene la lista de IPs del KV
    let visitas = await env.VISITAS.get(visitasKey, { type: "json" });
    if (!visitas) visitas = [];

    // Si la IP no está registrada, agrégala
    if (!visitas.includes(ip)) {
      visitas.push(ip);
      await env.VISITAS.put(visitasKey, JSON.stringify(visitas));
    }

    const contador = visitas.length;

    return new Response(JSON.stringify({ visitas: contador }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET"
      }
    });
  }
};
