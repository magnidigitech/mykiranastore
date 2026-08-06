const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parser
app.use(cors());
app.use(express.json());

// Paths
const DATA_FILE = path.join(__dirname, 'src', 'data', 'products.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'images');

// Enforce image directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

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

// Serve built frontend assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
