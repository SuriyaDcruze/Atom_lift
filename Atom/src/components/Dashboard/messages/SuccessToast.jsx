import { useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessToast = ({ message, description, autoClose = 3000 }) => {
  const progressRef = useRef(null);

  useEffect(() => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = '100%';
      progress.style.transition = `width ${autoClose}ms linear`;
      return () => {
        progress.style.width = '0';
        progress.style.transition = 'none';
      };
    }
  }, [autoClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 pr-8 w-full max-w-md overflow-hidden"
    >
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">Success!</h3>
          <div className="mt-1 text-sm text-green-700">
            <p>{message}</p>
            {description && <p className="mt-1 text-xs text-green-600">{description}</p>}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-100">
        <div ref={progressRef} className="h-full bg-green-500 w-0" />
      </div>
    </motion.div>
  );
};

export default SuccessToast;