// src/components/auth/PasswordStrengthMeter.tsx
"use client";
import React from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

const PasswordStrengthMeter = ({ password = '' }: PasswordStrengthMeterProps) => {
  const evaluateStrength = () => {
    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/\d/.test(password)) score++; // Contiene números
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Mayúsculas y minúsculas
    if (/[^A-Za-z0-9]/.test(password)) score++; // Símbolos especiales
    return score;
  };

  const score = evaluateStrength();
  const strengthLevels = [
    { label: 'Muy Débil', color: 'bg-red-500' },
    { label: 'Débil', color: 'bg-orange-500' },
    { label: 'Aceptable', color: 'bg-yellow-500' },
    { label: 'Buena', color: 'bg-blue-500' },
    { label: 'Fuerte', color: 'bg-green-500' },
    { label: 'Muy Fuerte', color: 'bg-emerald-500' },
  ];

  const currentStrength = strengthLevels[score];

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${currentStrength.color}`} 
          style={{ width: `${(score / 5) * 100}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-400 w-24 text-right">{currentStrength.label}</span>
    </div>
  );
};

export default PasswordStrengthMeter;