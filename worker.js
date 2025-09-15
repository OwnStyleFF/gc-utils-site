// Worker para contar visitantes únicos usando KV
export default {
  async fetch(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const visitasKey = "visitas_list";
  let visitas = await env.VISITAS.get(visitasKey, { type: "json" });
  if (!Array.isArray(visitas)) visitas = [];
    const url = new URL(request.url);

    // --- TOTP (Google Authenticator) validation ---
    // TOTP compatible con Google Authenticator (RFC 6238, SHA-1, 30s window)
    async function totp(secret, window = 30) {
      function base32Decode(str) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        let bytes = [];
        for (let c of str.replace(/=+$/, "")) {
          let v = alphabet.indexOf(c.toUpperCase());
          if (v < 0) continue;
          bits += v.toString(2).padStart(5, "0");
        }
        for (let i = 0; i + 8 <= bits.length; i += 8)
          bytes.push(parseInt(bits.slice(i, i + 8), 2));
        return new Uint8Array(bytes);
      }
      const key = base32Decode(secret);
      const epoch = Math.floor(Date.now() / 1000);
      let time = Math.floor(epoch / window);
      const msg = new Uint8Array(8);
      for (let i = 7; i >= 0; --i) msg[i] = time & 0xff, time >>= 8;
      const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
      const hmac = await crypto.subtle.sign("HMAC", cryptoKey, msg);
      const offset = new Uint8Array(hmac)[19] & 0xf;
      const code = (
        ((new Uint8Array(hmac)[offset] & 0x7f) << 24) |
        ((new Uint8Array(hmac)[offset + 1] & 0xff) << 16) |
        ((new Uint8Array(hmac)[offset + 2] & 0xff) << 8) |
        (new Uint8Array(hmac)[offset + 3] & 0xff)
      ) % 1000000;
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

    let index = visitas.findIndex(v => v.ip === ip);
    if (index === -1) {
      visitas.push({ ip, ua: userAgent });
      await env.VISITAS.put(visitasKey, JSON.stringify(visitas));
      index = visitas.length - 1;
    } else {
      // Actualiza el UA si cambió
      if (visitas[index].ua !== userAgent) {
        visitas[index].ua = userAgent;
        await env.VISITAS.put(visitasKey, JSON.stringify(visitas));
      }
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
