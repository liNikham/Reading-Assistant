const OCRService = require('../services/ocrService');
const fs = require('fs');

exports.processImage = async (req, res) => {
   console.log("in process image");
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Set a longer timeout for the request
    req.setTimeout(300000); // 5 minutes

    // Perform OCR
    const words = await OCRService.performOCR(req.file.path);

    // Send response
    res.json({
      success: true,
      data: words
    });

  } catch (error) {
    console.error('OCR Processing Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    // Clean up the uploaded file
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
  }
}; 