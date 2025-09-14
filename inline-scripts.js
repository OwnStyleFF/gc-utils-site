// --- Splash de bienvenida y navegación galáctica ---
(function(){
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
        if (!sessionStorage.getItem('fromSplash')) {
            window.location.replace('splash-inicio.html');
        } else {
            sessionStorage.removeItem('fromSplash');
        }
    }
    // Splash intergaláctico
    document.querySelectorAll('[data-galaxy-target]').forEach(function(el){
        el.addEventListener('click', function(e){
            e.preventDefault();
            var target = el.getAttribute('data-galaxy-target');
            if (target) {
                sessionStorage.setItem('galaxyTarget', target);
                window.location.href = 'splash.html';
            }
        });
    });
})();

// --- Fondo animado: sistema solar, estrellas y meteoritos ---
(function(){
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    const stars = Array.from({length: 120}, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.5 }));
    const planets = [
        {r: 40, color: '#ffe066', orbit: 0.18, speed: 0.01},
        {r: 10, color: '#b0b0b0', orbit: 70, speed: 0.03},
        {r: 14, color: '#f7c59f', orbit: 110, speed: 0.022},
        {r: 16, color: '#6ec6ff', orbit: 150, speed: 0.018},
        {r: 12, color: '#ff6f61', orbit: 190, speed: 0.015},
        {r: 28, color: '#ffe0b2', orbit: 240, speed: 0.012},
        {r: 24, color: '#bdbdbd', orbit: 290, speed: 0.009},
        {r: 18, color: '#90caf9', orbit: 340, speed: 0.007},
        {r: 16, color: '#b39ddb', orbit: 380, speed: 0.005}
    ];
    let planetAngles = planets.map(() => Math.random() * Math.PI * 2);
    const meteors = Array.from({length: 4}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 4 + 2,
        vy: Math.random() * 2 - 1,
        len: Math.random() * 60 + 40
    }));
    function drawSolarSystem() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#181a2b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.globalAlpha = 0.8;
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        });
        ctx.restore();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        planets.forEach((p, i) => {
            let angle = planetAngles[i];
            let px = cx + Math.cos(angle) * (p.orbit || 0);
            let py = cy + Math.sin(angle) * (p.orbit || 0);
            ctx.beginPath();
            ctx.arc(px, py, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = i === 0 ? 30 : 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        planets.forEach((p, i) => {
            if (i > 0) {
                ctx.beginPath();
                ctx.arc(cx, cy, p.orbit, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        meteors.forEach(m => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.len, m.y + m.len * 0.2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.restore();
        });
    }
    function animateSolarSystem() {
        planetAngles = planetAngles.map((a, i) => a + planets[i].speed);
        meteors.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;
            if (m.x > canvas.width + 40 || m.y > canvas.height + 40 || m.y < -40) {
                m.x = -60;
                m.y = Math.random() * canvas.height * 0.8;
                m.vx = Math.random() * 4 + 2;
                m.vy = Math.random() * 2 - 1;
                m.len = Math.random() * 60 + 40;
            }
        });
        drawSolarSystem();
        requestAnimationFrame(animateSolarSystem);
    }
    animateSolarSystem();
})();

// --- Visita alert modal ---


(function(){
    const overlay = document.getElementById('visita-overlay');
    const texto = document.getElementById('visita-text');
    const btn = document.getElementById('visita-cerrar');

    async function actualizarContador() {
        try {
            // URL de tu Worker
            const res = await fetch('https://ip-counter.stilesrockchock.workers.dev/', {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            });
            if (!res.ok) throw new Error('Respuesta no OK');

            const data = await res.json();
            const numero = data && data.numero ? data.numero : '?';
            texto.textContent = `Felicidades — eres el visitante número ${numero} en entrar a esta página.`;
        } catch (e) {
            console.error('Error al obtener el contador global:', e);
            texto.textContent = `Felicidades — contador global no disponible`;
        }
    }

    function openVisita(){
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden','false');
        btn && btn.focus();
    }

    function closeVisita(){
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden','true');
    }

    window.addEventListener('load', function(){
        actualizarContador();
        openVisita();
    });

    btn && btn.addEventListener('click', closeVisita);
})();

// --- Theme fallback logic ---
(function(){
    const CHECK_INTERVAL = 50;
    const TIMEOUT = 500;
    let waited = 0;
    function installFallback(){
        const toggle = document.getElementById('theme-toggle');
        const icons = Array.from(document.querySelectorAll('.theme-icon'));
        function apply(mode){
            document.body.classList.remove('light','dark');
            document.body.classList.add(mode);
            icons.forEach(ic => ic.textContent = mode === 'dark' ? '🌙' : '🌞');
            try { localStorage.setItem('theme', mode); } catch(e){}
        }
        let saved = null;
        try { saved = localStorage.getItem('theme'); } catch(e){ saved = null; }
        if (saved === 'dark' || saved === 'light') apply(saved); else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            apply(prefersDark ? 'dark' : 'light');
        }
        if (toggle) {
            toggle.checked = document.body.classList.contains('dark');
            toggle.addEventListener('change', function(){ apply(toggle.checked ? 'dark' : 'light'); });
            icons.forEach(ic => ic.addEventListener('click', function(){ toggle.checked = !toggle.checked; apply(toggle.checked ? 'dark' : 'light'); }));
        }
    }
    function check(){
        if (window.__themeToggleInitialized) return;
        waited += CHECK_INTERVAL;
        if (waited >= TIMEOUT){ installFallback(); return; }
        setTimeout(check, CHECK_INTERVAL);
    }
    setTimeout(check, CHECK_INTERVAL);
})();
