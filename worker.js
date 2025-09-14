// Worker para contar visitantes únicos usando KV
export default {
  async fetch(request, env) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const visitasKey = "visitas_list";

    // Obtiene la lista de IPs del KV
    let visitas = await env.VISITAS.get(visitasKey, { type: "json" });
    if (!visitas) visitas = [];

    let index = visitas.indexOf(ip);
    if (index === -1) {
      visitas.push(ip);
      await env.VISITAS.put(visitasKey, JSON.stringify(visitas));
      index = visitas.length - 1;
    }

    const contador = visitas.length;
    const numeroVisitante = index + 1; // 1-based

    return new Response(JSON.stringify({ visitas: contador, numero: numeroVisitante }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET"
      }
    });
  }
};
