require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Increase the timeout for the server
app.timeout = 300000; // 5 minutes

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://ocr-frontend.onrender.com'
    : 'http://localhost:3000'
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
const ocrRoutes = require('./src/routes/ocrRoutes');
app.use('/api/ocr', ocrRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
