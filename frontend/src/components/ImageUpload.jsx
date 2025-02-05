import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiImage, FiSearch } from 'react-icons/fi';

const ImageUpload = ({ setFile: setParentFile, setCoordinates }) => {
  const [localFile, setLocalFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      try {
        setIsProcessing(true);
        setLocalFile(selectedFile);
        const imageUrl = URL.createObjectURL(selectedFile);
        setParentFile(imageUrl);

        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch('http://localhost:5000/api/ocr/process', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          // Log all detected words with their confidence scores
          console.log('Detected Words:');
          data.data.forEach((word, index) => {
            console.log(`${index + 1}. "${word.text}" (Confidence: ${(word.confidence * 100).toFixed(1)}%)`);
            console.log('   Position:', {
              x0: Math.round(word.x0),
              y0: Math.round(word.y0),
              x1: Math.round(word.x1),
              y1: Math.round(word.y1)
            });
          });

          setCoordinates(data.data);
        } else {
          throw new Error(data.error || 'OCR processing failed');
        }
      } catch (err) {
        console.error('Error during OCR:', err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
          ${isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 bg-white'
          }
          shadow-lg hover:shadow-xl`}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full bg-purple-100"
          >
            <FiUploadCloud className="w-8 h-8 text-purple-500" />
          </motion.div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Drag & Drop or Click to Upload
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPG, PNG, GIF (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {localFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 rounded-xl overflow-hidden shadow-lg bg-white"
          >
            <div className="relative group">
              <img
                src={URL.createObjectURL(localFile)}
                alt="Preview"
                className="w-full h-[300px] sm:h-[400px] object-contain bg-gray-50"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-white"
                  >
                    <FiSearch className="w-8 h-8" />
                  </motion.div>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:opacity-100 opacity-0 transition-opacity"
              >
                <button
                  onClick={() => {
                    setLocalFile(null);
                    setParentFile(null);
                    setCoordinates(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove Image
                </button>
              </motion.div>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <FiImage className="text-purple-500" />
                <span className="text-sm text-gray-600 truncate">
                  {localFile.name}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageUpload;
