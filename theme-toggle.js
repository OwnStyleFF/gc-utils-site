// Shared theme toggle logic for the site
(function(){
  'use strict';
  // mark that the shared script file has been loaded (pages may check this)
  var __initialBg = null;
  var __initialHeaderBg = null;
  var __initialHeaderText = null;
  try {
    // capture the page's initial background variable so we can keep it fixed
    __initialBg = (getComputedStyle(document.body).getPropertyValue('--bg') || '').trim() || '#f4f6fa';
  } catch (e) {
    __initialBg = '#f4f6fa';
  }
  try {
    const headerEl = document.querySelector('header');
    // Prefer any declared CSS var --header-bg, else computed background color
    __initialHeaderBg = (getComputedStyle(document.body).getPropertyValue('--header-bg') || '').trim();
    if (!__initialHeaderBg && headerEl) {
      __initialHeaderBg = getComputedStyle(headerEl).backgroundColor || '';
    }
    __initialHeaderText = headerEl ? (getComputedStyle(headerEl).color || '') : '';
    if (!__initialHeaderBg) __initialHeaderBg = '#222';
  } catch (e) {
    __initialHeaderBg = '#222';
    __initialHeaderText = '#fff';
  }
  try { window.__themeTogglePresent = true; console.log('[theme-toggle] script loaded. document.readyState:', document.readyState, 'initial --bg:', __initialBg); } catch(e){}
  function findControls() {
    return {
      toggle: document.getElementById('theme-toggle'),
      // allow multiple icon placeholders on the page
      icons: Array.from(document.querySelectorAll('.theme-icon'))
    };
  }

  function setTheme(mode) {
    if (!mode) mode = 'light';
    document.body.classList.remove('light','dark');
    document.body.classList.add(mode);
    const controls = findControls();
    if (controls.toggle) controls.toggle.checked = (mode === 'dark');
    if (controls.icons && controls.icons.length) {
      controls.icons.forEach(ic => ic.textContent = (mode === 'dark') ? '🌙' : '🌞');
    }
    // Persist preference
    try { localStorage.setItem('theme', mode); } catch(e) { /* ignore storage errors */ }

    // IMPORTANT: keep the page background fixed. Many pages declare
    // `body { background: var(--bg) }` and `body.dark { --bg: ... }`.
    // We capture the initial --bg value when the script loads and
    // re-apply it as an inline custom property so the global page
    // background doesn't change when theme toggles. Only card/text
    // variables are changed below.
    try {
      if (__initialBg) document.body.style.setProperty('--bg', __initialBg);
    } catch (e) { /* ignore */ }

    // Apply only the variables that should change with theme (text and cards)
    try {
      if (mode === 'dark') {
        document.body.style.setProperty('--text', '#eee');
        document.body.style.setProperty('--card-bg', '#23272b');
        document.body.style.setProperty('--card-text', '#eee');
        // keep header background/text fixed to captured values
        try {
          const h = document.querySelector('header');
          if (h) {
            h.style.background = __initialHeaderBg;
            if (__initialHeaderText) h.style.color = __initialHeaderText;
          }
        } catch(e){}
      } else {
        document.body.style.setProperty('--text', '#222');
        document.body.style.setProperty('--card-bg', '#fff');
        document.body.style.setProperty('--card-text', '#222');
        // keep header background/text fixed to captured values
        try {
          const h = document.querySelector('header');
          if (h) {
            h.style.background = __initialHeaderBg;
            if (__initialHeaderText) h.style.color = __initialHeaderText;
          }
        } catch(e){}
      }
    } catch (e) { console.error('[theme-toggle] failed to set theme variables', e); }
  }

  function init() {
    console.log('[theme-toggle] init called. locating controls...');
    // Initialize from saved preference or system setting
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch(e) { saved = null; }
    if (saved === 'dark' || saved === 'light') {
      console.log('[theme-toggle] applying saved theme:', saved);
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const auto = prefersDark ? 'dark' : 'light';
      console.log('[theme-toggle] no saved theme; using system preference:', auto);
      setTheme(auto);
    }

    // Helper to attach listeners to the toggle and icons
    function attachListenersTo(toggle, icons){
      if (!toggle) return;
      try {
        if (toggle.__themeListenersAttached) return;
        toggle.__themeListenersAttached = true;
        toggle.addEventListener('change', function(){
          const mode = toggle.checked ? 'dark' : 'light';
          console.log('[theme-toggle] toggle changed, applying:', mode);
          setTheme(mode);
        });
        if (icons && icons.length) {
          icons.forEach(ic => ic.addEventListener('click', function(e){
            e.preventDefault(); e.stopPropagation();
            toggle.checked = !toggle.checked;
            const mode = toggle.checked ? 'dark' : 'light';
            console.log('[theme-toggle] icon clicked, toggling to:', mode);
            setTheme(mode);
          }));
        }
        console.log('[theme-toggle] listeners attached to toggle');
      } catch(err){ console.error('[theme-toggle] attachListenersTo error', err); }
    }

    // Polling: try to find the toggle for a short period and attach listeners
    (function waitAndAttach(){
      const MAX_WAIT = 2000; // ms
      const INTERVAL = 100; // ms
      let waited = 0;
      const iv = setInterval(function(){
        const controls = findControls();
        if (controls.toggle) {
          attachListenersTo(controls.toggle, controls.icons);
          clearInterval(iv);
          try { window.__themeToggleInitialized = true; } catch(e) { console.error('[theme-toggle] could not set __themeToggleInitialized flag', e); }
          return;
        }
        waited += INTERVAL;
        if (waited >= MAX_WAIT) {
          clearInterval(iv);
          console.warn('[theme-toggle] toggle not found after wait; listeners not attached');
          try { window.__themeToggleInitialized = true; } catch(e) { console.error('[theme-toggle] could not set __themeToggleInitialized flag', e); }
        }
      }, INTERVAL);
    })();

    // Listen to OS preference changes and update only if user hasn't explicitly chosen
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const mqHandler = function(e){ try { if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark':'light'); } catch(_){}};
      if (mq.addEventListener) mq.addEventListener('change', mqHandler); else if (mq.addListener) mq.addListener(mqHandler);
    } catch (e) { /* ignore */ }
  }

  // call init safely; init itself will set the global flag when complete
  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ try { init(); } catch(err){ console.error('[theme-toggle] init() threw', err); }});
    else { try { init(); } catch(err){ console.error('[theme-toggle] init() threw', err); }}
  } catch(e) { console.error('[theme-toggle] failed to schedule init', e); }
})();
