const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'https://thecosmicview.com';
const OUT_DIR = './out';

const GA_SCRIPT = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3PSD4SKHVM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-3PSD4SKHVM');
</script>`;

// Use wget to mirror the site
console.log('Downloading site with wget...');
try {
  execSync(`wget --mirror --convert-links --no-parent --no-host-directories -P ${OUT_DIR} ${BASE_URL}`, { stdio: 'inherit' });
} catch(e) {
  console.log('wget completed (may have warnings)');
}

// Inject GA tag into all HTML files
function injectGA(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      injectGA(fullPath);
    } else if (entry.name.endsWith('.html') || !entry.name.includes('.')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('</head>') && !content.includes('G-3PSD4SKHVM')) {
          content = content.replace('</head>', GA_SCRIPT + '\n</head>');
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Injected GA into:', fullPath);
        }
      } catch(e) {
        // skip binary files
      }
    }
  }
}

if (fs.existsSync(OUT_DIR)) {
  injectGA(OUT_DIR);
  console.log('GA injection complete!');
} else {
  console.error('Output directory not found!');
  process.exit(1);
}
