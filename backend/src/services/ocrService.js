const { createWorker } = require('tesseract.js');

class OCRService {
  constructor() {
    this.workers = {};
  }

  async initWorker(language) {
    if (!this.workers[language]) {
      const worker = await createWorker();
      await worker.loadLanguage(language);
      await worker.initialize(language);
      this.workers[language] = worker;
    }
    return this.workers[language];
  }

  async performOCR(imagePath, language) {
    try {
      if (!['eng', 'hin', 'mar'].includes(language)) {
        throw new Error('Invalid language. Use "eng", "hin", or "mar".');
      }

      const worker = await this.initWorker(language);
      console.log(`Processing image in ${language}:`, imagePath);
      
      const result = await worker.recognize(imagePath);
      console.log('OCR completed');

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
