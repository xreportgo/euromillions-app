// src/components/common/LotteryBall.js
import React from 'react';

const LotteryBall = ({ number, type = 'number', size = 'md', className = '' }) => {
  // Vérifier que number est un nombre valide
  const isValidNumber = !isNaN(number) && number !== undefined && number !== null;
  
  if (!isValidNumber) {
    console.error('Invalid number for LotteryBall:', number);
    return null;
  }
  
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-12 w-12 text-lg';
      default: return 'h-10 w-10 text-sm';
    }
  };

  const getBallStyle = () => {
    if (type === 'star') {
      return 'bg-yellow-400 text-yellow-900 border-yellow-500';
    }
    return 'bg-blue-600 text-white border-blue-700';
  };

  return (
    <div 
      className={`flex items-center justify-center ${getSize()} rounded-full font-bold ${getBallStyle()} shadow-sm ${className}`}
    >
      {number}
    </div>
  );
};

export default LotteryBall;
