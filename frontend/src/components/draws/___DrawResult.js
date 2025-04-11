import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import LotteryBall from '../common/LotteryBall';

const DrawResult = ({ draw }) => {
  const { t } = useTranslation();
  
  // Format date to a readable format
  const formattedDate = format(new Date(draw.date), 'EEEE d MMMM yyyy');
  
  // Format jackpot amount
  const formatJackpot = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    
      
        
          {formattedDate}
          
            {draw.numbers.map((number) => (
              
            ))}
            +
            {draw.stars.map((star) => (
              
            ))}
          
        
        
        
          
            {formatJackpot(draw.jackpot)}
          
          {draw.jackpotWinners > 0 ? (
            
              {t('jackpotWon', { count: draw.jackpotWinners })}
            
          ) : (
            
              {t('noJackpotWinners')}
            
          )}
        
      
    
  );
};

export default DrawResult;