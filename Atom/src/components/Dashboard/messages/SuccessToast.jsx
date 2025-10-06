import { useEffect, useRef } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessToast = ({ message, description, autoClose = 3000, onClose }) => {
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
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="relative bg-green-50 border border-green-200 rounded-lg shadow-xl p-4 pr-8 w-full max-w-sm overflow-hidden backdrop-blur-sm ring-1 ring-green-200/50"
    >
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">Success!</h3>
          <div className="mt-1 text-sm text-green-700">
            <p>{message}</p>
            {description && <p className="mt-1 text-xs text-green-600">{description}</p>}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-green-400 hover:text-green-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-100">
        <div ref={progressRef} className="h-full bg-green-500 w-0" />
      </div>
    </motion.div>
  );
};

export default SuccessToast;