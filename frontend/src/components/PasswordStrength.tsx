import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (p: string) => boolean;
}

const requirements: Requirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

function getStrength(password: string): { score: number; label: string; color: string; bg: string } {
  if (!password) return { score: 0, label: '', color: '', bg: '' };
  
  const passed = requirements.filter((r) => r.test(password)).length;
  
  if (passed <= 1) return { score: 1, label: 'Weak', color: 'text-red-400', bg: 'bg-red-500' };
  if (passed === 2) return { score: 2, label: 'Fair', color: 'text-orange-400', bg: 'bg-orange-500' };
  if (passed === 3) return { score: 3, label: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-500' };
  if (passed === 4) return { score: 4, label: 'Strong', color: 'text-lime-400', bg: 'bg-lime-500' };
  return { score: 5, label: 'Very Strong', color: 'text-emerald-400', bg: 'bg-emerald-500' };
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const strength = getStrength(password);
  
  if (!password) return null;
  
  const passedCount = requirements.filter((r) => r.test(password)).length;

  return (
    <div className="space-y-2 mt-1">
      {/* Strength bar */}
      {password && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(strength.score / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${strength.bg}`}
            />
          </div>
          {strength.label && (
            <span className={`text-[10px] font-medium ${strength.color} min-w-[64px] text-right`}>
              {strength.label}
            </span>
          )}
        </div>
      )}
      
      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <div key={req.label} className="flex items-center gap-1.5">
              {passed ? (
                <Check className="h-2.5 w-2.5 text-emerald-400" />
              ) : (
                <X className="h-2.5 w-2.5 text-slate-500" />
              )}
              <span className={`text-[10px] ${passed ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
