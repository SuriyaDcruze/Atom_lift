import { useEffect, useRef } from 'react';
import { XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorToast = ({ message, description, autoClose = 3000, onClose }) => {
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
      className="relative bg-red-50 border border-red-200 rounded-lg shadow-xl p-4 pr-8 w-full max-w-sm overflow-hidden backdrop-blur-sm ring-1 ring-red-200/50"
    >
      <div className="flex items-start">
        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error!</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{message}</p>
            {description && <p className="mt-1 text-xs text-red-600">{description}</p>}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-100">
        <div ref={progressRef} className="h-full bg-red-500 w-0" />
      </div>
    </motion.div>
  );
};

export default ErrorToast;