import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiImage, FiSearch } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ImageUpload = ({ setFile: setParentFile, setCoordinates }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [localFile, setLocalFile] = useState(null);
  const [extractedWords, setExtractedWords] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const warmupServer = async () => {
      try {
        const response = await fetch(`${API_URL}/ping`);
        console.log('Server warmed up:', await response.text());
      } catch (err) {
        console.log('Server warming up...');
      }
    };
    
    warmupServer();
  }, []);

  const handleFile = async (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      try {
        setIsProcessing(true);
        setLocalFile(selectedFile);
        const imageUrl = URL.createObjectURL(selectedFile);
        setParentFile(imageUrl);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('language', selectedLanguage);

        const response = await fetch(`${API_URL}/api/ocr/process`, {
          method: 'POST',
          body: formData,
        });

        
        const data = await response.json();
        if (data.success) {
          setCoordinates(data.data);
          setExtractedWords(data.data.map(word => word.text));
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

  const handleWordClick = async (word, index) => {
    const highlightedWords = document.querySelectorAll('.highlighted');
    highlightedWords.forEach(el => el.classList.remove('highlighted'));

    const wordElement = document.querySelector(`[data-word-index="${index}"]`);
    if (wordElement) {
      wordElement.classList.add('highlighted');
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(word);

        // Detect language (simple check)
    const isHindi = /[\u0900-\u097F]/.test(word);
    const isMarathi = /[\u0900-\u097F]/.test(word); // Marathi shares script with Hindi
    if (isHindi) {
      speech.lang = 'hi-IN'; // Hindi
    } else if (isMarathi) {
      speech.lang = 'mr-IN'; // Marathi
    } else {  speech.lang = 'en-US'; // Default to English
    }

      speech.rate = 0.6;
      speech.pitch = 1;
      speech.volume = 1;

      window.speechSynthesis.speak(speech);
    }
  };

  const displayExtractedText = (words) => {
    return words.map((word, index) => (
      <motion.span
        key={index}
        data-word-index={index}
        onClick={() => handleWordClick(word, index)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="word"
      >
        {word}
      </motion.span>
    ));
  };

  const styles = `
    .word {
      display: inline-block;
      margin: 2px 4px;
      padding: 2px 4px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      font-size: clamp(14px, 3vw, 16px);
    }
    .word:hover {
      color: #6d28d9;
      background-color: #ede9fe;
    }
    .highlighted {
      color: #6d28d9;
      background-color: #ddd6fe;
      font-weight: 500;
    }
    @media (max-width: 640px) {
      .word {
        margin: 1px 2px;
        padding: 1px 2px;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2 sm:p-4 md:p-6">
      <style>{styles}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl"
        >
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 text-center">
            Select Document Language
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            {[
              { id: 'eng', label: 'English' },
              { id: 'hin', label: 'Hindi' },
              { id: 'mar', label: 'Marathi' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLanguage(lang.id);
                  setLocalFile(null);
                  setParentFile(null);
                  setExtractedWords([]);
                }}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 ${
                  selectedLanguage === lang.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </motion.div>

        {selectedLanguage ? (
          <div
            className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-12 backdrop-blur-sm 
              transition-all duration-500 ease-out transform hover:scale-[1.02]
              ${isDragging
                ? 'border-violet-500 bg-violet-50/80'
                : 'border-gray-300/50 hover:border-violet-400 bg-white/70'
              }
              shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]`}
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

            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-4 sm:p-6 rounded-full bg-gradient-to-tr from-violet-500 to-purple-600 shadow-lg"
              >
                <FiUploadCloud className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Drag & Drop or Click to Upload
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Supports JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 p-4 sm:p-6 text-sm sm:text-base"
          >
            Please select a language before uploading an image
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {localFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 sm:mt-8 rounded-xl sm:rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl"
            >
              <div className="relative group">
                <img
                  src={URL.createObjectURL(localFile)}
                  alt="Preview"
                  className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-contain bg-gradient-to-br from-gray-50 to-gray-100"
                />
                {isProcessing && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-white"
                    >
                      <FiSearch className="w-10 h-10" />
                    </motion.div>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 transition-all duration-300"
                >
                  <button
                    onClick={() => {
                      setLocalFile(null);
                      setParentFile(null);
                      setCoordinates(null);
                    }}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl
                      hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300
                      font-medium shadow-lg hover:shadow-xl"
                  >
                    Remove Image
                  </button>
                </motion.div>
              </div>
              <div className="p-3 sm:p-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-violet-100 rounded-lg">
                    <FiImage className="text-violet-500 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    {localFile.name}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {extractedWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-6 p-3 sm:p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl"
          >
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Extracted Text
            </h3>
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {displayExtractedText(extractedWords)}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ImageUpload;
