// frontend/src/components/ConnectionError.tsx
// Fancy, branded "can't reach the API" state. Full-screen dark variant is used
// for dedicated error pages; `compact` renders a lighter card for in-page use.

import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionErrorProps {
  onRetry?: () => void;
  compact?: boolean;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry, compact = false }) => {
  if (compact) {
    return (
      <div className="w-full flex justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 mb-5">
            <WifiOff className="h-9 w-9 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">We can't reach the store right now</h3>
          <p className="mt-2 text-slate-500">
            Please check your connection and try again — we'll be back in a jiffy.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="mt-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative inline-flex"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/40 to-emerald-500/40 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center">
            <WifiOff className="h-11 w-11 text-teal-400" />
          </div>
        </motion.div>

        <h1 className="mt-8 text-2xl md:text-4xl font-extrabold text-white tracking-tight">
          We can't reach <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">BOLDVAN</span> right now
        </h1>
        <p className="mt-3 text-slate-400 text-base md:text-lg">
          Our store is having a moment. Please check your connection and try again — we'll be right back.
        </p>

        {onRetry && (
          <Button
            onClick={onRetry}
            className="mt-8 px-8 py-3 text-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        )}

        <p className="mt-6 text-xs text-slate-500">
          If this keeps happening, our support team is happy to help — support@boldvan.com
        </p>
      </motion.div>
    </div>
  );
};

export default ConnectionError;
