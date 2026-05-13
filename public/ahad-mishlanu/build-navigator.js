const fs = require('fs');
const path = require('path');

const pages = [
  { id: 'portal',     label: 'פורטל ראשי',           file: 'portal-final.html' },
  { id: 'ahad',       label: 'אחד משלנו',            file: 'אחד משלנו - standalone.html' },
  { id: 'esek',       label: 'העסק של כולנו',        file: 'העסק של כולנו.html' },
  { id: 'kehilot',    label: 'קהילות השווים',        file: 'קהילות השווים - standalone.html' },
  { id: 'wireframe',  label: 'וויירפריים',           file: 'ווירפריים - אחד משלנו.html' },
];

const escapeForScriptTag = (s) =>
  s.replace(/<\/script>/gi, '<\\/script>');

const blocks = pages.map(p => {
  const content = fs.readFileSync(path.join(__dirname, p.file), 'utf8');
  return `<script type="text/html" id="page-${p.id}" data-label="${p.label}">${escapeForScriptTag(content)}</script>`;
}).join('\n');

const tabs = pages.map((p, i) => `      <button class="tab${i===0?' active':''}" data-target="page-${p.id}">${p.label}</button>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>אחד משלנו — סקירה ללקוח</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Heebo", "Assistant", sans-serif;
      background: #0D2545;
      color: #fff;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #1B3F6E;
      border-bottom: 3px solid #F9E44A;
      padding: 14px 24px 0;
      flex-shrink: 0;
    }
    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }
    .brand {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .brand small {
      font-size: 12px;
      font-weight: 400;
      opacity: 0.7;
      margin-inline-start: 8px;
    }
    .meta {
      font-size: 12px;
      opacity: 0.65;
    }
    .tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      overflow-x: auto;
    }
    .tab {
      background: transparent;
      color: #fff;
      border: none;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      border-top-right-radius: 8px;
      border-top-left-radius: 8px;
      border-bottom: 3px solid transparent;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .tab:hover { background: rgba(255,255,255,0.07); }
    .tab.active {
      background: #fff;
      color: #0D2545;
      border-bottom-color: #F9E44A;
      font-weight: 700;
    }
    main {
      flex: 1;
      position: relative;
      background: #fff;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
    .loader {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1B3F6E;
      color: #fff;
      font-size: 14px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .loader.show { opacity: 1; }
    .hint {
      position: fixed;
      bottom: 12px;
      inset-inline-start: 12px;
      background: rgba(13,37,69,0.9);
      color: #fff;
      font-size: 12px;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid rgba(249,228,74,0.4);
      z-index: 100;
      pointer-events: none;
      opacity: 0;
      animation: fadeOut 6s forwards;
    }
    @keyframes fadeOut {
      0%, 70% { opacity: 1; }
      100% { opacity: 0; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-row">
      <div class="brand">אחד משלנו <small>— סקירה ללקוח</small></div>
      <div class="meta">לחצו על כרטיסיה למעבר בין דפים. גלילה בתוך כל דף נשמרת.</div>
    </div>
    <nav class="tabs" id="tabs">
${tabs}
    </nav>
  </header>
  <main>
    <iframe id="viewer" title="תצוגת דף"></iframe>
    <div class="loader" id="loader">טוען דף...</div>
  </main>
  <div class="hint">טיפ: השתמשו בכרטיסיות בראש הדף לניווט</div>

${blocks}

  <script>
    const viewer = document.getElementById('viewer');
    const loader = document.getElementById('loader');
    const tabs = document.querySelectorAll('.tab');

    function loadPage(scriptId) {
      const el = document.getElementById(scriptId);
      if (!el) return;
      loader.classList.add('show');
      viewer.srcdoc = el.textContent;
      viewer.addEventListener('load', () => loader.classList.remove('show'), { once: true });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadPage(tab.dataset.target);
      });
    });

    // load first
    loadPage(tabs[0].dataset.target);
  </script>
</body>
</html>`;

const outPath = path.join(__dirname, 'סקירה-ללקוח.html');
fs.writeFileSync(outPath, html, 'utf8');
const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
console.log(`✔ Built: ${outPath}`);
console.log(`  Size: ${sizeMB} MB`);
console.log(`  Pages: ${pages.length}`);
