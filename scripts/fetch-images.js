/**
 * Fetches real product images for all shoes and saves them to /images/
 * Tries multiple sources per shoe with fallback chain.
 * Runs in GitHub Actions with full internet access.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ── Image source URLs per shoe ───────────────────────────────────────────────
// Multiple fallbacks per shoe. First working one wins.
const SHOE_SOURCES = {
  // ── Adidas ──
  'evo3': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/adizero-adios-pro-evo-3-schuh/KH7678_9191.jpg',
    'https://www.adidas.de/adizero-adios-pro-evo-3-schuh/KH7678.html', // og:image fallback
  ],
  'evo2': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/IF1671_9191/adizero-adios-pro-evo-2.jpg',
  ],
  'adios-pro4': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/IF1663_9191/adizero-adios-pro-4.jpg',
  ],
  'adizero-sl2': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/KI7351_9191/adizero-evo-sl.jpg',
  ],
  'boston12': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/IF1538_9191/adizero-boston-12.jpg',
  ],
  'supernova3': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/IF3012_9191/supernova-rise-2.jpg',
  ],
  'hyperboost-edge': [
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/JH9498_9191/hyperboost-edge.jpg',
  ],

  // ── Nike ──
  'alphafly3': [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-5b9a-4fc1-9fc1-7714e6ed9005,c_scale,fl_relative,w_1.0/d6de7c0b-5e7c-43c1-a0b8-8a6e06af5f6b/alphafly-3-road-racing-shoes.png',
  ],
  'vaporfly4': [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/92a5f7ce-0e3c-4433-b58f-3e15af7b7a83/vaporfly-next-4.png',
  ],
  'peg-plus': [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/pegasus-plus.png',
  ],
  'vomero18': [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/vomero-18.png',
  ],
  'vomero-plus': [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/vomero-plus.png',
  ],
  'pegasus41': [
    'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/pegasus-41.png',
  ],

  // ── Asics ──
  'sky-tokyo': ['https://images.asics.com/is/image/asics/1013A082_960_SR_RT_GLB?$PDP_554$'],
  'edge-tokyo': ['https://images.asics.com/is/image/asics/1013A083_960_SR_RT_GLB?$PDP_554$'],
  'superblast3': ['https://images.asics.com/is/image/asics/1013A127_400_SR_RT_GLB?$PDP_554$'],
  'novablast5': ['https://images.asics.com/is/image/asics/1012B599_400_SR_RT_GLB?$PDP_554$'],
  'kayano32': ['https://images.asics.com/is/image/asics/1011B691_400_SR_RT_GLB?$PDP_554$'],
  'nimbus28': ['https://images.asics.com/is/image/asics/1011B783_400_SR_RT_GLB?$PDP_554$'],
  'megablast': ['https://images.asics.com/is/image/asics/1013A136_400_SR_RT_GLB?$PDP_554$'],
  'gel-excite10': ['https://images.asics.com/is/image/asics/1011B636_400_SR_RT_GLB?$PDP_554$'],

  // ── Puma ──
  'fast-r3': ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/311163/01/sv01/fglob/fast-r-nitro-elite-3.jpg'],
  'deviate-elite4': ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/309584/01/sv01/fglob/deviate-nitro-elite-4.jpg'],
  'deviate3': ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/309454/01/sv01/fglob/deviate-nitro-elite-3.jpg'],
  'deviate-nitro4': ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/311151/01/sv01/fglob/deviate-nitro-4.jpg'],

  // ── Saucony ──
  'endorphin-elite2': ['https://www.saucony.com/dw/image/v2/AABF_PRD/on/demandware.static/-/Sites-saucony-master-catalog/default/images/large/S20868-210_2.jpg?sw=600'],
  'endorphin-speed5': ['https://www.saucony.com/dw/image/v2/AABF_PRD/on/demandware.static/-/Sites-saucony-master-catalog/default/images/large/S20944-25_2.jpg?sw=600'],
  'endorphin-pro5': ['https://www.saucony.com/dw/image/v2/AABF_PRD/on/demandware.static/-/Sites-saucony-master-catalog/default/images/large/S20939-210_2.jpg?sw=600'],
  'endorphin-azura': ['https://www.saucony.com/dw/image/v2/AABF_PRD/on/demandware.static/-/Sites-saucony-master-catalog/default/images/large/S21197-30_2.jpg?sw=600'],

  // ── Hoka ──
  'bondi9': ['https://www.hoka.com/dw/image/v2/AABZ_PRD/on/demandware.static/-/Sites-hoka-master/default/1155524_BBCRM_1.jpg?sw=600'],
  'clifton10': ['https://www.hoka.com/dw/image/v2/AABZ_PRD/on/demandware.static/-/Sites-hoka-master/default/1142011_WHST_1.jpg?sw=600'],
  'mach7': ['https://www.hoka.com/dw/image/v2/AABZ_PRD/on/demandware.static/-/Sites-hoka-master/default/1155319_SHW_1.jpg?sw=600'],
  'mach-x3': ['https://www.hoka.com/dw/image/v2/AABZ_PRD/on/demandware.static/-/Sites-hoka-master/default/1141530_FWWT_1.jpg?sw=600'],
  'gaviota6': ['https://www.hoka.com/dw/image/v2/AABZ_PRD/on/demandware.static/-/Sites-hoka-master/default/1164191_VPBY_1.jpg?sw=600'],
  'cielo3': ['https://www.hoka.com/dw/image/v2/AABZ_PRD/on/demandware.static/-/Sites-hoka-master/default/1155160_WPAX_1.jpg?sw=600'],

  // ── New Balance ──
  'sc-elite-v4': ['https://nb.scene7.com/is/image/NB/MRCELI4_nb_02_i?$pdpMain$'],
  'nb1080v15': ['https://nb.scene7.com/is/image/NB/M1080V15_nb_02_i?$pdpMain$'],
  'sc-trainer3': ['https://nb.scene7.com/is/image/NB/MSCT3V3_nb_02_i?$pdpMain$'],

  // ── On Running ──
  'cloudboom-strike': ['https://images.on-running.com/is/image/On/cloudboom-strike-main?$transparentBg$&wid=600'],
  'cloudrunner3': ['https://images.on-running.com/is/image/On/cloudrunner-3-main?$transparentBg$&wid=600'],
  'cloudeclipse2': ['https://images.on-running.com/is/image/On/cloudmonster-2-main?$transparentBg$&wid=600'],
  'on-lightspray': ['https://images.on-running.com/is/image/On/cloudboom-strike-ls-main?$transparentBg$&wid=600'],

  // ── Brooks ──
  'hyperion-elite4': ['https://s7d9.scene7.com/is/image/Brooks/120386_409?$pdpMainDesktop$'],
  'hyperion-max3': ['https://s7d9.scene7.com/is/image/Brooks/110390_1B310?$pdpMainDesktop$'],
  'glycerin23': ['https://s7d9.scene7.com/is/image/Brooks/120401_1B464?$pdpMainDesktop$'],
  'glycerin-flex': ['https://s7d9.scene7.com/is/image/Brooks/120407_468?$pdpMainDesktop$'],
  'adrenaline22': ['https://s7d9.scene7.com/is/image/Brooks/120381_1D472?$pdpMainDesktop$'],

  // ── Mizuno ──
  'hyperwarp-pure': ['https://images.mizuno.eu/catalog/product/J1/GC2375/J1GC2375_14_1.jpg'],
  'wave-sky7': ['https://images.mizuno.eu/catalog/product/J1/GC2320/J1GC2320_09_1.jpg'],
  'neozen2': ['https://images.mizuno.eu/catalog/product/J1/GC2315/J1GC2315_09_1.jpg'],

  // ── Under Armour ──
  'velociti-elite3': ['https://underarmour.scene7.com/is/image/Underarmour/3026520-001_DEFAULT?wid=600&hei=600'],
};

function fetchImage(url, timeout = 10000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/webp,image/png,image/jpeg,image/*',
        'Referer': 'https://www.google.com/',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        resolve(fetchImage(res.headers.location, timeout));
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        resolve(null);
        return;
      }
      const ct = res.headers['content-type'] || '';
      if (!ct.includes('image')) {
        res.resume();
        resolve(null);
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function getExt(url) {
  if (url.includes('.webp')) return 'webp';
  if (url.includes('.png') || url.includes('png')) return 'png';
  return 'jpg';
}

async function main() {
  const results = { found: 0, failed: 0, skipped: 0 };

  for (const [id, sources] of Object.entries(SHOE_SOURCES)) {
    // Check if we already have a real image (not SVG placeholder)
    const existingJpg = path.join(IMAGES_DIR, `${id}.jpg`);
    const existingPng = path.join(IMAGES_DIR, `${id}.png`);
    const existingWebp = path.join(IMAGES_DIR, `${id}.webp`);
    if (fs.existsSync(existingJpg) || fs.existsSync(existingPng) || fs.existsSync(existingWebp)) {
      console.log(`⏭ ${id}: already have image`);
      results.skipped++;
      continue;
    }

    let downloaded = false;
    for (const url of sources) {
      process.stdout.write(`  Trying ${id}: ${url.slice(0, 70)}... `);
      const data = await fetchImage(url);
      if (data && data.length > 5000) { // real image > 5KB
        const ext = getExt(url);
        const outPath = path.join(IMAGES_DIR, `${id}.${ext}`);
        fs.writeFileSync(outPath, data);
        console.log(`✓ ${data.length} bytes → ${id}.${ext}`);
        results.found++;
        downloaded = true;
        break;
      } else {
        console.log(`✗ (${data ? data.length + 'b' : 'null'})`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
    if (!downloaded) {
      console.log(`✗ ${id}: all sources failed`);
      results.failed++;
    }
  }

  console.log(`\n✓ Downloaded: ${results.found}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`⏭ Skipped: ${results.skipped}`);
}

main().catch(e => { console.error(e); process.exit(1); });
