const { createWorker } = require('tesseract.js');

class OCRService {
  constructor() {
    this.worker = null;
  }

  async initWorker() {
    if (!this.worker) {
      this.worker = await createWorker();
      await this.worker.loadLanguage('eng+hin+mar'); // Load English, Hindi, and Marathi
      await this.worker.initialize('eng+hin+mar'); // Initialize with multiple languages
    }
    return this.worker;
  }

  async performOCR(imagePath) {
    try {
      const worker = await this.initWorker();
      console.log('Processing image:', imagePath);
      
      const result = await worker.recognize(imagePath);
      console.log('OCR completed');

      // Convert Tesseract result to your existing format
      const words = result.data.words.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: [
          [word.bbox.x0, word.bbox.y0],
          [word.bbox.x1, word.bbox.y0],
          [word.bbox.x1, word.bbox.y1],
          [word.bbox.x0, word.bbox.y1]
        ]
      }));

      return words;
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  }
}

module.exports = new OCRService();
