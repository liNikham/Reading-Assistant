const { spawn } = require('child_process');
const path = require('path');

class OCRService {
  async performOCR(imagePath) {
    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(__dirname, 'ocr_service.py');
      const pythonProcess = spawn('python3', ['src/services/ocr_service.py', imagePath]);
      
      let outputData = '';

      // Handle standard output (JSON result)
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Handle progress messages
      pythonProcess.stderr.on('data', (data) => {
        // Just log progress messages
        console.log('OCR Progress:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('OCR process failed'));
          return;
        }

        try {
          // Only try to parse the actual output data
          const result = JSON.parse(outputData);
          if (result.success) {
            resolve(result.data);
          } else {
            reject(new Error(result.error));
          }
        } catch (error) {
          reject(new Error(`Failed to parse OCR result: ${error.message}\nOutput: ${outputData}`));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start OCR process: ${error.message}`));
      });
    });
  }
}

module.exports = new OCRService(); 