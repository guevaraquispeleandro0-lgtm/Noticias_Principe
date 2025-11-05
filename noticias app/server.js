const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from current directory

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Ensure images directory exists
if (!fs.existsSync('images')) {
  fs.mkdirSync('images');
}

// Path to data.json
const dataPath = path.join(__dirname, 'data.json');

// Helper function to read data
function readData() {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write data
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// API Routes

// GET /api/news - Get all news
app.get('/api/news', (req, res) => {
  const news = readData();
  res.json(news);
});

// POST /api/news - Add new news
app.post('/api/news', upload.single('image'), (req, res) => {
  const news = readData();
  const newNews = {
    id: Date.now().toString(),
    title: req.body.title,
    content: req.body.content,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    category: req.body.category,
    imagePath: req.file ? req.file.filename : null
  };
  news.push(newNews);
  writeData(news);
  res.json({ success: true, news: newNews });
});

// DELETE /api/news/:id - Delete news by id
app.delete('/api/news/:id', (req, res) => {
  const news = readData();
  const filteredNews = news.filter(item => item.id !== req.params.id);
  if (filteredNews.length !== news.length) {
    // Remove image file if exists
    const deletedNews = news.find(item => item.id === req.params.id);
    if (deletedNews && deletedNews.imagePath) {
      const imagePath = path.join(__dirname, 'images', deletedNews.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    writeData(filteredNews);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'News not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Instructions:
// 1. Run 'npm install' to install dependencies
// 2. Run 'node server.js' to start the server
// 3. Open browser to http://localhost:3000/index.html
