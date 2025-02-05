import Tesseract from 'tesseract.js';

export const extractCoordinates = (imageFile) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(
      imageFile,
      'eng', // You can change the language here
      {
        logger: (m) => console.log(m), // Optionally log OCR progress
      }
    ).then(({ data: { words, text } }) => {
      // Log the complete response to check for any issues
      console.log('Tesseract data:', { words, text });

      // Check if words is defined and is an array
      if (!words || !Array.isArray(words)) {
        return reject(new Error('No words detected in the image'));
      }

      // Map through the words and extract coordinates
      const wordCoordinates = words.map((word) => ({
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        word: word.text,
      }));

      console.log('Coordinates:', wordCoordinates); // Log the array of coordinates
      resolve(wordCoordinates);
    }).catch(err => reject(err));
  });
};
