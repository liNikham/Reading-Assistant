const OCRService = require('../services/ocrService');
const path = require('path');

exports.processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('Processing image:', req.file.path);
    const result = await OCRService.performOCR(req.file.path);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in processImage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 