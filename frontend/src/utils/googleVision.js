// Import required modules
import dotenv from 'dotenv'; 
dotenv.config();
import vision from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

// Set the path to your service account key
const keyFilePath = path.join(__dirname, 'google-credentials.json'); // Adjust if needed

// Create an auth client using the service account JSON key file
const auth = new GoogleAuth({
  keyFile: keyFilePath, // Path to the credentials file
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

// Create a Vision API client with the credentials
const client = new vision.ImageAnnotatorClient({
  auth: auth,
});

// Function to extract text from image using Google Vision API
export const extractTextFromImage = async (imagePath) => {
  try {
    // Perform text detection on the image
    const [result] = await client.textDetection(imagePath);
    const text = result.fullTextAnnotation.text;
    const coordinates = result.textAnnotations.map(annotation => annotation.boundingPoly);

    return { text, coordinates };
  } catch (error) {
    console.error('Error during text extraction:', error);
    throw new Error('OCR failed');
  }
}

