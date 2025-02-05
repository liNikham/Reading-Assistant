import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ImageWithHighlight = ({ file, coordinates }) => {
  const imgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imgRef.current) {
      const updateDimensions = () => {
        setDimensions({
          width: imgRef.current.width,
          height: imgRef.current.height
        });
      };

      imgRef.current.addEventListener('load', updateDimensions);
      return () => imgRef.current?.removeEventListener('load', updateDimensions);
    }
  }, [file]);

  const renderHighlights = () => {
    if (!coordinates || !dimensions.width) return null;

    return coordinates.map((word, index) => {
      const style = {
        position: 'absolute',
        left: `${(word.x0 / dimensions.width) * 100}%`,
        top: `${(word.y0 / dimensions.height) * 100}%`,
        width: `${((word.x1 - word.x0) / dimensions.width) * 100}%`,
        height: `${((word.y1 - word.y0) / dimensions.height) * 100}%`,
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        border: '1px solid rgba(255, 200, 0, 0.5)',
        pointerEvents: 'none',
      };

      return (
        <motion.div
          key={index}
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          title={word.text}
        />
      );
    });
  };

  return (
    <div className="relative inline-block">
      <img
        ref={imgRef}
        src={file}
        alt="Uploaded content"
        className="max-w-full h-auto"
      />
      {renderHighlights()}
    </div>
  );
};

export default ImageWithHighlight;
