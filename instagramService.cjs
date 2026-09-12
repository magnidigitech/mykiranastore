const fs = require('fs');
const path = require('path');

const INSTAGRAM_URL = 'https://www.instagram.com/mykiranastore_ca/';
const DATA_FILE = path.join(__dirname, 'src', 'data', 'instagramFeed.json');
const IMG_DIR = path.join(__dirname, 'public', 'instagram');

// Baseline fallback in case network is down or initial run
const DEFAULT_INSTAGRAM_FEED = {
  username: "mykiranastore_ca",
  name: "mykiranastore",
  bio: "Indian grocery store in Calgary • Weekly in-store deals & fresh arrivals",
  profileUrl: INSTAGRAM_URL,
  followers: "859+",
  following: "4",
  lastSynced: new Date().toISOString(),
  posts: [
    {
      id: "insta-1",
      postUrl: "https://www.instagram.com/mykiranastore_ca/p/DdMaIwkkoiY/",
      imageUrl: "/instagram/post-1.jpg",
      originalImageUrl: null,
      caption: "THIS WEEK DEALS (11th Sep - 17th Sep): Sona Masoori Rice, Matta Rice, Daawat Basmati Rice & weekly pantry staples on special discount!",
      likes: "In-Store Specials",
      date: "September 12, 2026"
    },
    {
      id: "insta-2",
      postUrl: "https://www.instagram.com/mykiranastore_ca/p/DdMZ6awkiUf/",
      imageUrl: "/instagram/post-2.jpg",
      originalImageUrl: null,
      caption: "Fresh shipment of authentic Indian spices, pickles, and traditional juices in stock. Visit us in Calgary!",
      likes: "Fresh Arrivals",
      date: "September 12, 2026"
    },
    {
      id: "insta-3",
      postUrl: "https://www.instagram.com/mykiranastore_ca/p/DdMUWx0Ej3a/",
      imageUrl: "/instagram/post-3.jpg",
      originalImageUrl: null,
      caption: "Special offers on authentic flours (atta), lentils, and traditional snacks. Open 7 days a week.",
      likes: "Weekly Offers",
      date: "September 11, 2026"
    },
    {
      id: "insta-4",
      postUrl: "https://www.instagram.com/mykiranastore_ca/p/DdMH8bfkh13/",
      imageUrl: "/instagram/post-4.jpg",
      originalImageUrl: null,
      caption: "Fresh vegetables and South Indian spices arrived. Best prices on all daily kitchen essentials.",
      likes: "New Stock",
      date: "September 10, 2026"
    },
    {
      id: "insta-5",
      postUrl: "https://www.instagram.com/mykiranastore_ca/p/DdBw-rDF1m-/",
      imageUrl: "/instagram/post-5.jpg",
      originalImageUrl: null,
      caption: "Pooja items, sweets, and festival treats now available for your celebrations in Calgary!",
      likes: "Festival Special",
      date: "September 8, 2026"
    },
    {
      id: "insta-6",
      postUrl: "https://www.instagram.com/mykiranastore_ca/p/DdBwvqOoAoQ/",
      imageUrl: "/instagram/post-6.jpg",
      originalImageUrl: null,
      caption: "Quality Indian groceries delivered to your home or available in-store at 6520 36 St NE, Calgary.",
      likes: "Store Update",
      date: "September 7, 2026"
    }
  ]
};

function ensureDirs() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_INSTAGRAM_FEED, null, 2), 'utf8');
  }
}

function getStoredInstagramFeed() {
  try {
    ensureDirs();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.posts)) {
      data.posts = data.posts.map(p => ({
        ...p,
        caption: sanitizeCaption(p.caption)
      }));
    }
    return data;
  } catch (err) {
    console.error('[InstagramService] Error reading stored feed:', err.message);
    return DEFAULT_INSTAGRAM_FEED;
  }
}

function saveInstagramFeed(data) {
  try {
    ensureDirs();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[InstagramService] Error saving feed:', err.message);
    return false;
  }
}

async function downloadImage(remoteUrl, localPath) {
  try {
    const res = await fetch(remoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return true;
  } catch (err) {
    console.warn(`[InstagramService] Failed to download image from ${remoteUrl.slice(0, 50)}...`, err.message);
    return false;
  }
}

async function scrapeInstagram() {
  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'google-chrome',
    'chromium',
    'chromium-browser'
  ];

  let executablePath = null;
  for (const cp of chromePaths) {
    if (cp.startsWith('/') && fs.existsSync(cp)) {
      executablePath = cp;
      break;
    }
  }

  if (!executablePath) {
    throw new Error('No compatible Chrome browser executable found');
  }

  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(INSTAGRAM_URL, { waitUntil: 'networkidle2', timeout: 25000 });

    const rawData = await page.evaluate(() => {
      // Find follower count
      let followers = '859+';
      const text = document.body.innerText;
      const m = text.match(/([0-9,KMkm.]+)\s*followers/i);
      if (m) followers = m[1];

      // Find posts
      const anchors = Array.from(document.querySelectorAll('a[href*="/p/"]'));
      const postsList = [];
      const seen = new Set();

      anchors.forEach((a, idx) => {
        const postUrl = a.href;
        if (seen.has(postUrl)) return;
        seen.add(postUrl);

        const img = a.querySelector('img');
        const imageUrl = img ? img.src : null;
        let caption = img ? (img.alt || '') : '';

        // Clean caption
        caption = caption.replace(/^Photo by [^.]+on[^.]+\./i, '').trim();
        if (caption.startsWith('May be an image of')) {
          caption = caption.replace(/^May be an image of\s*/i, '');
        }

        const quoteMatch = caption.match(/text that says ["“](.*?)["”]/is);
        if (quoteMatch && quoteMatch[1]) {
          let extracted = quoteMatch[1].trim();
          extracted = extracted.replace(/(403[-.\s]?497[-.\s]?2777|Unit\s*1125.*|6520\s*36\s*St.*)/gi, '').trim();
          // Snap directly to recognized campaign headlines if present
          extracted = extracted.replace(/^[\s\S]*?(THIS WEEK DEALS|Tent Sale|VINAYAKA CHAVITHI|Divine Ganesha|POOJA ITEMS)/i, '$1');
          extracted = extracted.replace(/^([KTVM\/\s\-_]+My\s*Kiranastore|Grocery\s*General\s*Store|Grocery&GeneralStore|Grocen\s*rocery&General\d*|NA\s*C[ИI]THI)[\s:\-_]*/gi, '').trim();
          extracted = extracted.replace(/^([KTVM\/\s\-_]+My\s*Kirana\s*store)[\s:\-_]*/gi, '').trim();
          extracted = extracted.replace(/\s+/g, ' ').trim();
          if (extracted.length > 120) {
            extracted = extracted.slice(0, 117) + '...';
          }
          if (extracted.length >= 8) {
            caption = extracted;
          }
        } else {
          caption = caption.replace(/^(pet food|food|card|calendar|poster|globe amaranth|herb|vegetable|wafer|juice|spice|text|banner)(,\s*(pet food|food|card|calendar|poster|globe amaranth|herb|vegetable|wafer|juice|spice|text|banner))*\s*(and\s*text\.?)?/gi, '').trim();
          caption = caption.replace(/^[,\s.:\-–—]+/, '').trim();
        }

        if (!caption || caption.length < 5) {
          caption = 'Weekly in-store Indian grocery deals & fresh arrivals';
        }

        postsList.push({
          idx: idx + 1,
          postUrl,
          imageUrl,
          caption
        });
      });

      return { followers, posts: postsList.slice(0, 8) };
    });

    return rawData;
  } finally {
    await browser.close();
  }
}

function sanitizeCaption(raw) {
  if (!raw || typeof raw !== 'string') {
    return 'Weekly in-store Indian grocery deals & fresh arrivals';
  }
  let str = raw.trim();

  // 1. Look for text in quotes (Instagram OCR provides: text that says "...")
  const quoteMatch = str.match(/text that says ["“]([\s\S]*?)["”]/i);
  if (quoteMatch && quoteMatch[1]) {
    let inner = quoteMatch[1].trim();
    inner = inner.replace(/(403[-.\s]?497[-.\s]?2777|Unit\s*1125.*|6520\s*36\s*St.*|Calgary,\s*AB.*)/gi, '').trim();
    const headlineMatch = inner.match(/(THIS WEEK DEALS|Tent Sale|VINAYAKA CHAVITHI|Divine Ganesha|POOJA ITEMS)[\s\S]*/i);
    if (headlineMatch) {
      inner = headlineMatch[0];
    }
    inner = inner.replace(/^([KTVM\/\s\-_]+My\s*Kiranastore|Grocery\s*General\s*Store|Grocery&GeneralStore|Grocen\s*rocery&General\d*|NA\s*C[ИI]THI)[\s:\-_]*/gi, '').trim();
    inner = inner.replace(/^([KTVM\/\s\-_]+My\s*Kirana\s*store)[\s:\-_]*/gi, '').trim();
    inner = inner.replace(/\s+/g, ' ').trim();

    if (inner.length > 95) {
      inner = inner.slice(0, 92) + '...';
    }
    if (inner.length >= 8) {
      return inner;
    }
  }

  // 2. Strip standard Instagram OCR noise prefixes
  str = str.replace(/^(pet food|food|card|calendar|poster|globe amaranth|herb|vegetable|wafer|juice|spice|text|banner)(,\s*(pet food|food|card|calendar|poster|globe amaranth|herb|vegetable|wafer|juice|spice|text|banner))*\s*(and\s*text\.?)?/gi, '').trim();
  str = str.replace(/^[,\s.:\-–—]+/, '').trim();

  if (!str || str.length < 5) {
    return 'Weekly in-store Indian grocery deals & fresh arrivals';
  }
  if (str.length > 95) {
    str = str.slice(0, 92) + '...';
  }
  return str;
}

async function syncInstagram() {
  console.log('[InstagramService] Starting live Instagram sync for @mykiranastore_ca...');
  try {
    ensureDirs();
    const scraped = await scrapeInstagram();
    const posts = [];

    for (const p of scraped.posts) {
      const filename = `post-${p.idx}.jpg`;
      const localFile = path.join(IMG_DIR, filename);
      const webPath = `/instagram/${filename}`;

      let hasImage = false;
      if (p.imageUrl) {
        hasImage = await downloadImage(p.imageUrl, localFile);
      }

      posts.push({
        id: `insta-${p.idx}`,
        postUrl: p.postUrl,
        imageUrl: hasImage ? webPath : (p.imageUrl || webPath),
        originalImageUrl: p.imageUrl,
        caption: sanitizeCaption(p.caption),
        likes: "In-Store Special",
        date: "Recently"
      });
    }

    const payload = {
      username: "mykiranastore_ca",
      name: "mykiranastore",
      bio: "Indian grocery store in Calgary • Weekly in-store deals & fresh arrivals",
      profileUrl: INSTAGRAM_URL,
      followers: scraped.followers ? `${scraped.followers} followers` : "859+ followers",
      following: "4",
      lastSynced: new Date().toISOString(),
      source: "live_instagram_sync",
      posts: posts.length > 0 ? posts : DEFAULT_INSTAGRAM_FEED.posts
    };

    saveInstagramFeed(payload);
    console.log(`[InstagramService] Successfully synced ${payload.posts.length} posts for @mykiranastore_ca!`);
    return payload;
  } catch (err) {
    console.warn('[InstagramService] Live sync encountered issue, preserving stored feed:', err.message);
    return getStoredInstagramFeed();
  }
}

function initInstagramService() {
  ensureDirs();
  setTimeout(() => {
    syncInstagram().catch(err => console.error('[InstagramService] Initial sync error:', err.message));
  }, 4000);

  setInterval(() => {
    syncInstagram().catch(err => console.error('[InstagramService] Periodic sync error:', err.message));
  }, 12 * 60 * 60 * 1000);
}

module.exports = {
  getStoredInstagramFeed,
  syncInstagram,
  initInstagramService,
  DEFAULT_INSTAGRAM_FEED
};
