const { formatDraw, formatDraws, validateDraw, getNextDrawDate } = require('../drawUtils');

describe('Draw Utilities', () => {
  describe('formatDraw', () => {
    test('should correctly format a draw from DB', () => {
      const dbDraw = {
        id: 1,
        date: '2023-04-11',
        numbers: '1,15,23,35,47',
        stars: '2,9',
        jackpot: '€17,000,000',
        winners: '0'
      };
      
      const expected = {
        id: 1,
        date: '2023-04-11',
        numbers: [1, 15, 23, 35, 47],
        stars: [2, 9],
        jackpot: '€17,000,000',
        winners: '0'
      };
      
      expect(formatDraw(dbDraw)).toEqual(expected);
    });
    
    test('should return null if no draw is provided', () => {
      expect(formatDraw(null)).toBeNull();
    });
    
    test('should handle malformed data gracefully', () => {
      const malformedDraw = {
        id: 1,
        date: '2023-04-11',
        numbers: 'invalid',
        stars: '2,9',
        jackpot: '€17,000,000',
        winners: '0'
      };
      
      const result = formatDraw(malformedDraw);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.date).toBe('2023-04-11');
      expect(Array.isArray(result.numbers)).toBe(true);
      expect(result.stars).toEqual([2, 9]);
    });
  });
  
  describe('formatDraws', () => {
    test('should format an array of draws', () => {
      const dbDraws = [
        {
          id: 1,
          date: '2023-04-11',
          numbers: '1,15,23,35,47',
          stars: '2,9',
          jackpot: '€17,000,000',
          winners: '0'
        },
        {
          id: 2,
          date: '2023-04-14',
          numbers: '5,12,25,33,41',
          stars: '3,10',
          jackpot: '€26,000,000',
          winners: '1'
        }
      ];
      
      const result = formatDraws(dbDraws);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(Array.isArray(result[0].numbers)).toBe(true);
      expect(Array.isArray(result[0].stars)).toBe(true);
    });
    
    test('should return empty array if no draws are provided', () => {
      expect(formatDraws(null)).toEqual([]);
      expect(formatDraws([])).toEqual([]);
      expect(formatDraws('invalid')).toEqual([]);
    });
  });
  
  describe('validateDraw', () => {
    test('should validate a correct draw', () => {
      const draw = {
        date: '2023-04-11',
        numbers: [1, 15, 23, 35, 47],
        stars: [2, 9]
      };
      
      const { isValid, errors } = validateDraw(draw);
      
      expect(isValid).toBe(true);
      expect(errors).toHaveLength(0);
    });
    
    test('should reject a draw without date', () => {
      const draw = {
        numbers: [1, 15, 23, 35, 47],
        stars: [2, 9]
      };
      
      const { isValid, errors } = validateDraw(draw);
      
      expect(isValid).toBe(false);
      expect(errors).toContain('La date est requise');
    });
    
    test('should reject a draw with invalid numbers count', () => {
      const draw = {
        date: '2023-04-11',
        numbers: [1, 15, 23, 35], // Only 4 numbers
        stars: [2, 9]
      };
      
      const { isValid, errors } = validateDraw(draw);
      
      expect(isValid).toBe(false);
      expect(errors).toContain('5 numéros sont requis');
    });
    
    test('should reject a draw with invalid numbers range', () => {
      const draw = {
        date: '2023-04-11',
        numbers: [1, 15, 23, 35, 51], // 51 is out of range
        stars: [2, 9]
      };
      
      const { isValid, errors } = validateDraw(draw);
      
      expect(isValid).toBe(false);
      expect(errors).toContain('Les numéros doivent être compris entre 1 et 50');
    });
    
    test('should reject a draw with invalid stars count', () => {
      const draw = {
        date: '2023-04-11',
        numbers: [1, 15, 23, 35, 47],
        stars: [2, 9, 11] // 3 stars instead of 2
      };
      
      const { isValid, errors } = validateDraw(draw);
      
      expect(isValid).toBe(false);
      expect(errors).toContain('2 étoiles sont requises');
    });
    
    test('should reject a draw with invalid stars range', () => {
      const draw = {
        date: '2023-04-11',
        numbers: [1, 15, 23, 35, 47],
        stars: [2, 13] // 13 is out of range
      };
      
      const { isValid, errors } = validateDraw(draw);
      
      expect(isValid).toBe(false);
      expect(errors).toContain('Les étoiles doivent être comprises entre 1 et 12');
    });
  });
  
  describe('getNextDrawDate', () => {
    // Cette fonction dépend de la date actuelle, donc les tests sont plus difficiles
    // Nous allons simplement vérifier qu'elle retourne une date valide
    
    test('should return a valid date string', () => {
      const nextDrawDate = getNextDrawDate();
      
      // Vérifier le format (YYYY-MM-DD)
      expect(nextDrawDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Vérifier que c'est une date future ou égale à aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      expect(nextDrawDate >= today).toBe(true);
    });
  });
});
