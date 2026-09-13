const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getStoredReviews, syncReviews, initReviewsService } = require('./googleReviewsService.cjs');
const { getStoredInstagramFeed, syncInstagram, initInstagramService } = require('./instagramService.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parser
app.use(cors());
app.use(express.json());

// Paths
const DATA_FILE = path.join(__dirname, 'src', 'data', 'products.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const INSTAGRAM_DIR = path.join(__dirname, 'public', 'instagram');

// Enforce image directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(INSTAGRAM_DIR)) {
  fs.mkdirSync(INSTAGRAM_DIR, { recursive: true });
}

// Serve images folder statically
app.use('/images', express.static(IMAGES_DIR));
app.use('/instagram', express.static(INSTAGRAM_DIR));

// Helper to sanitize filenames (keep spaces, alphanumeric, hyphens, and underscores)
function sanitizeFilename(name) {
  return name.replace(/[\\/*?:"<>|]/g, '').trim();
}

// Multer Storage config for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const productName = req.body.productName ? sanitizeFilename(req.body.productName) : 'product_image';
    const timestamp = Date.now();
    cb(null, `${productName}-${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper: Read products JSON
function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
}

// Helper: Write products JSON
function writeProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
}

// --- API ROUTES ---

// 1. GET all products
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// 2. POST create product
app.post('/api/products', (req, res) => {
  const products = readProducts();
  const { name, brand, categories, inStock, image } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  // Find next numeric ID
  const maxId = products.reduce((max, p) => {
    const numericId = parseInt(p.id) || 0;
    return numericId > max ? numericId : max;
  }, 0);
  const nextId = String(maxId + 1);

  const newProduct = {
    id: nextId,
    name: name.trim(),
    price: 4.99, // default fallback
    original_image: image ? path.basename(image) : '',
    image: image || '/images/placeholder.png',
    categories: Array.isArray(categories) && categories.length > 0 ? categories : ['General'],
    brand: brand ? brand.trim() : 'Kiran Store',
    inStock: inStock !== undefined ? !!inStock : true
  };

  products.push(newProduct);
  if (writeProducts(products)) {
    res.status(201).json(newProduct);
  } else {
    res.status(500).json({ error: 'Failed to write product data.' });
  }
});

// 3. PUT update product
app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const productId = req.params.id;
  const { name, brand, categories, inStock, image } = req.body;

  const index = products.findIndex(p => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const updatedProduct = {
    ...products[index],
    name: name !== undefined ? name.trim() : products[index].name,
    brand: brand !== undefined ? brand.trim() : products[index].brand,
    categories: Array.isArray(categories) ? categories : products[index].categories,
    inStock: inStock !== undefined ? !!inStock : products[index].inStock,
    image: image !== undefined ? image : products[index].image
  };

  products[index] = updatedProduct;
  if (writeProducts(products)) {
    res.json(updatedProduct);
  } else {
    res.status(500).json({ error: 'Failed to save product data.' });
  }
});

// 4. DELETE product
app.delete('/api/products/:id', (req, res) => {
  const products = readProducts();
  const productId = req.params.id;

  const index = products.findIndex(p => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const product = products[index];
  if (product.image && product.image.startsWith('/images/') && product.image !== '/images/placeholder.png') {
    const imagePath = path.join(__dirname, 'public', product.image);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Failed to delete image file:', err);
      }
    }
  }

  const filtered = products.filter(p => p.id !== productId);
  if (writeProducts(filtered)) {
    res.json({ success: true, message: 'Product deleted successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to save product data.' });
  }
});

// 4.5. POST bulk delete products
app.post('/api/products/bulk-delete', (req, res) => {
  const products = readProducts();
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'List of product IDs is required.' });
  }
  
  // Delete associated images
  const toDelete = products.filter(p => ids.includes(p.id));
  toDelete.forEach(product => {
    if (product.image && product.image.startsWith('/images/') && product.image !== '/images/placeholder.png') {
      const imagePath = path.join(__dirname, 'public', product.image);
      if (fs.existsSync(imagePath)) {
        try { fs.unlinkSync(imagePath); } catch (err) {}
      }
    }
  });

  const filtered = products.filter(p => !ids.includes(p.id));
  if (writeProducts(filtered)) {
    res.json({ success: true, count: toDelete.length });
  } else {
    res.status(500).json({ error: 'Failed to write product data.' });
  }
});

// 4.6. POST bulk update categories
app.post('/api/products/bulk-update-categories', (req, res) => {
  const products = readProducts();
  const { ids, categories } = req.body;
  if (!Array.isArray(ids) || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'List of IDs and categories array are required.' });
  }

  const updated = products.map(p => {
    if (ids.includes(p.id)) {
      return { ...p, categories: categories };
    }
    return p;
  });

  if (writeProducts(updated)) {
    res.json({ success: true, count: ids.length });
  } else {
    res.status(500).json({ error: 'Failed to write product data.' });
  }
});

// 4.7. POST bulk update stock status
app.post('/api/products/bulk-update-stock', (req, res) => {
  const products = readProducts();
  const { ids, inStock } = req.body;
  if (!Array.isArray(ids) || inStock === undefined) {
    return res.status(400).json({ error: 'List of IDs and inStock boolean value are required.' });
  }

  const updated = products.map(p => {
    if (ids.includes(p.id)) {
      return { ...p, inStock: !!inStock };
    }
    return p;
  });

  if (writeProducts(updated)) {
    res.json({ success: true, count: ids.length });
  } else {
    res.status(500).json({ error: 'Failed to write product data.' });
  }
});

// 5. POST image upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const imageUrl = `/images/${req.file.filename}`;
  res.json({ imageUrl });
});

// 6. GET sitemap.xml for Google SEO ranking
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://mykiranastore.ca';

  const products = readProducts();
  const categories = new Set();
  products.forEach(p => {
    if (Array.isArray(p.categories)) {
      p.categories.forEach(c => categories.add(c));
    }
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  const staticPaths = ['', '/products', '/location', '/offers', '/contact', '/mylist'];
  staticPaths.forEach(path => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${path}</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
  });

  // Dynamic Category Pages
  categories.forEach(cat => {
    const encodedCat = encodeURIComponent(cat);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/products?category=${encodedCat}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.status(200).send(xml);
});

// 7. GET robots.txt
app.get('/robots.txt', (req, res) => {
  const content = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /admin

# Sitemap URL
Sitemap: https://mykiranastore.ca/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.status(200).send(content);
});


// --- Google Reviews API ---
app.get('/api/reviews', (req, res) => {
  try {
    const reviews = getStoredReviews();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

app.post('/api/reviews/sync', async (req, res) => {
  try {
    const fresh = await syncReviews();
    res.json({ success: true, data: fresh });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync reviews', message: err.message });
  }
});

// --- Instagram Feed API ---
app.get('/api/instagram', (req, res) => {
  try {
    const feed = getStoredInstagramFeed();
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve Instagram feed' });
  }
});

app.post('/api/instagram/sync', async (req, res) => {
  try {
    const fresh = await syncInstagram();
    res.json({ success: true, data: fresh });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync Instagram', message: err.message });
  }
});

// Serve built frontend assets in production with anti-cache headers for sw.js and index.html
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('index.html') || filepath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  app.get(/.*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  initReviewsService();
  initInstagramService();
});
