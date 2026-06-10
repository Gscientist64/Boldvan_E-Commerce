// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 7000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React dev server
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Mock data
const products = [
  { id: '1', name: 'Solar Panel 300W', description: 'High-efficiency monocrystalline solar panel', price: 299.99, stockQuantity: 50, categoryId: '1', imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400' },
  { id: '2', name: 'Solar Inverter 5000W', description: 'Pure sine wave solar inverter', price: 899.99, stockQuantity: 25, categoryId: '2', imageUrl: 'https://images.unsplash.com/photo-1624395213043-fa2e123b2656?w-400' },
  { id: '3', name: 'Solar Battery 12V 200Ah', description: 'Deep cycle AGM solar battery', price: 399.99, stockQuantity: 30, categoryId: '3', imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400' },
];

const categories = [
  { id: '1', name: 'Solar Panels' },
  { id: '2', name: 'Inverters' },
  { id: '3', name: 'Batteries' },
  { id: '4', name: 'Mounting Systems' },
  { id: '5', name: 'Accessories' },
];

// Products API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    products.splice(index, 1);
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Categories API Routes
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// File upload endpoint (mock)
app.post('/api/upload', (req, res) => {
  // In a real app, you'd handle file upload here
  setTimeout(() => {
    res.json({ 
      url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      message: 'File uploaded successfully (mock)' 
    });
  }, 1000);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});