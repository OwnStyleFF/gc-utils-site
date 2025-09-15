// Worker para contar visitantes únicos usando KV
export default {
  async fetch(request, env) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const visitasKey = "visitas_list";
    let visitas = await env.VISITAS.get(visitasKey, { type: "json" });
    if (!visitas) visitas = [];
    const url = new URL(request.url);

    // --- TOTP (Google Authenticator) validation ---
    // Simple TOTP implementation (RFC 6238, SHA-1, 30s window)
    function base32ToHex(base32) {
      let bits = "";
      let hex = "";
      for (let i = 0; i < base32.length; i++) {
        let val = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(base32.charAt(i).toUpperCase());
        bits += ("00000" + val.toString(2)).slice(-5);
      }
      for (let i = 0; i + 4 <= bits.length; i += 4) {
        hex += parseInt(bits.substr(i, 4), 2).toString(16);
      }
      return hex;
    }
    async function totp(secret, window = 30) {
      const key = base32ToHex(secret.replace(/\s+/g, ""));
      const epoch = Math.floor(Date.now() / 1000);
      const time = Math.floor(epoch / window).toString(16).padStart(16, "0");
      const cryptoKey = await crypto.subtle.importKey("raw", new Uint8Array(time.match(/.{2}/g).map(b => parseInt(b, 16))), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
      const hmac = await crypto.subtle.sign("HMAC", cryptoKey, new Uint8Array(key.match(/.{2}/g).map(b => parseInt(b, 16))));
      const offset = new Uint8Array(hmac)[19] & 0xf;
      const code = ((new Uint8Array(hmac)[offset] & 0x7f) << 24 | (new Uint8Array(hmac)[offset + 1] & 0xff) << 16 | (new Uint8Array(hmac)[offset + 2] & 0xff) << 8 | (new Uint8Array(hmac)[offset + 3] & 0xff)) % 1000000;
      return code.toString().padStart(6, "0");
    }

    // Admin mode: return full IP list if ?totp=xxxxxx is present and valid
    const totpCode = url.searchParams.get("totp");
    const TOTP_SECRET = "IOP4TY67HBASD4FW"; // Cambia esto por tu clave secreta base32
    if (totpCode) {
      try {
        const valid = (await totp(TOTP_SECRET)) === totpCode;
        if (valid) {
          return new Response(JSON.stringify({ visitas }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET"
            }
          });
        }
      } catch(e) {}
    }

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
