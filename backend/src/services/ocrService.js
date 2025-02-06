const { spawn } = require('child_process');
const path = require('path');

class OCRService {
  async performOCR(imagePath) {
    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(__dirname, 'ocr_service.py');
      const pythonProcess = spawn('python3', [pythonScriptPath, imagePath], {
        // Increase the max buffer size
        maxBuffer: 1024 * 1024 * 100, // 100MB
        timeout: 300000 // 5 minutes
      });
      
      let outputData = '';
      let errorData = '';

      // Handle standard output (JSON result)
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Handle progress messages
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.log('OCR Progress:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Process exited with code:', code);
          console.error('Error output:', errorData);
          reject(new Error(`OCR process failed: ${errorData}`));
          return;
        }

        try {
          // Only try to parse the actual output data
          const result = JSON.parse(outputData);
          if (result.success) {
            resolve(result.data);
          } else {
            reject(new Error(result.error || 'Unknown OCR error'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse OCR result: ${error.message}\nOutput: ${outputData}\nError: ${errorData}`));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        console.error('Process error:', error);
        reject(new Error(`Failed to start OCR process: ${error.message}`));
      });
    });
  }
}

module.exports = new OCRService(); 