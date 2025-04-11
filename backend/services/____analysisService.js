/**
 * Service d'analyse statistique pour l'EuroMillions
 * Fournit des fonctions pour analyser les données des tirages
 */

const Draw = require('../models/drawModel');
const logger = require('../utils/logger');

/**
 * Calcule la fréquence d'apparition de chaque numéro et étoile
 * @param {Array
} draws - Liste des tirages à analyser
 * @returns {Object} Fréquences calculées
 */
const calculateFrequencies = (draws) => {
    if (!draws || draws.length === 0) {
        return {
            numbers: {},
            stars: {},
            totalDraws: 0
        };
    }

    const numbersFreq = {};
    const starsFreq = {};
    
    // Initialisation des compteurs
    for (let i = 1; i <= 50; i++) {
        numbersFreq[i] = 0;
    }
    
    for (let i = 1; i <= 12; i++) {
        starsFreq[i] = 0;
    }
    
    // Calcul des fréquences
    draws.forEach(draw => {
        // Comptage des numéros
        draw.numbers.forEach(number => {
            numbersFreq[number]++;
        });
        
        // Comptage des étoiles
        draw.stars.forEach(star => {
            starsFreq[star]++;
        });
    });
    
    return {
        numbers: numbersFreq,
        stars: starsFreq,
        totalDraws: draws.length
    };
};

/**
 * Obtient les numéros et étoiles les plus fréquents
 * @param {Object} frequencies - Objet contenant les fréquences calculées
 * @param {number} topCount - Nombre d'éléments à retourner (défaut: 5 pour numéros, 2 pour étoiles)
 * @returns {Object} Les numéros et étoiles les plus fréquents
 */
const getHotNumbers = (frequencies, { numbersCount = 5, starsCount = 2 } = {}) => {
    const sortedNumbers = Object.entries(frequencies.numbers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, numbersCount)
        .map(entry => parseInt(entry[0], 10));
    
    const sortedStars = Object.entries(frequencies.stars)
        .sort((a, b) => b[1] - a[1])
        .slice(0, starsCount)
        .map(entry => parseInt(entry[0], 10));
    
    return {
        numbers: sortedNumbers,
        stars: sortedStars
    };
};

/**
 * Obtient les numéros et étoiles les moins fréquents
 * @param {Object} frequencies - Objet contenant les fréquences calculées
 * @param {number} topCount - Nombre d'éléments à retourner (défaut: 5 pour numéros, 2 pour étoiles)
 * @returns {Object} Les numéros et étoiles les moins fréquents
 */
const getColdNumbers = (frequencies, { numbersCount = 5, starsCount = 2 } = {}) => {
    const sortedNumbers = Object.entries(frequencies.numbers)
        .sort((a, b) => a[1] - b[1])
        .slice(0, numbersCount)
        .map(entry => parseInt(entry[0], 10));
    
    const sortedStars = Object.entries(frequencies.stars)
        .sort((a, b) => a[1] - b[1])
        .slice(0, starsCount)
        .map(entry => parseInt(entry[0], 10));
    
    return {
        numbers: sortedNumbers,
        stars: sortedStars
    };
};

/**
 * Calcule les délais entre les apparitions d'un numéro
 * @param {Array
} draws - Liste des tirages
 * @returns {Object} Délais pour chaque numéro et étoile
 */
const calculateDelays = (draws) => {
    if (!draws || draws.length === 0) {
        return {
            numbers: {},
            stars: {}
        };
    }
    
    // Tri des tirages par date (du plus ancien au plus récent)
    const sortedDraws = [...draws].sort((a, b) => 
        new Date(a.draw_date) - new Date(b.draw_date)
    );
    
    const numbersDelays = {};
    const starsDelays = {};
    
    // Initialisation des structures
    for (let i = 1; i <= 50; i++) {
        numbersDelays[i] = {
            lastSeen: -1,  // Position du dernier tirage où le numéro a été vu
            delays: []     // Liste des délais entre les apparitions
        };
    }
    
    for (let i = 1; i <= 12; i++) {
        starsDelays[i] = {
            lastSeen: -1,
            delays: []
        };
    }
    
    // Calcul des délais
    sortedDraws.forEach((draw, index) => {
        // Traitement des numéros
        draw.numbers.forEach(number => {
            if (numbersDelays[number].lastSeen !== -1) {
                const delay = index - numbersDelays[number].lastSeen;
                numbersDelays[number].delays.push(delay);
            }
            numbersDelays[number].lastSeen = index;
        });
        
        // Traitement des étoiles
        draw.stars.forEach(star => {
            if (starsDelays[star].lastSeen !== -1) {
                const delay = index - starsDelays[star].lastSeen;
                starsDelays[star].delays.push(delay);
            }
            starsDelays[star].lastSeen = index;
        });
    });
    
    // Calcul des délais moyens
    const numbersAvgDelays = {};
    const starsAvgDelays = {};
    
    for (let i = 1; i <= 50; i++) {
        const delays = numbersDelays[i].delays;
        if (delays.length > 0) {
            const sum = delays.reduce((acc, val) => acc + val, 0);
            numbersAvgDelays[i] = sum / delays.length;
        } else {
            numbersAvgDelays[i] = Infinity;
        }
    }
    
    for (let i = 1; i <= 12; i++) {
        const delays = starsDelays[i].delays;
        if (delays.length > 0) {
            const sum = delays.reduce((acc, val) => acc + val, 0);
            starsAvgDelays[i] = sum / delays.length;
        } else {
            starsAvgDelays[i] = Infinity;
        }
    }
    
    return {
        numbers: numbersAvgDelays,
        stars: starsAvgDelays,
        raw: {
            numbers: numbersDelays,
            stars: starsDelays
        }
    };
};

/**
 * Calcule les statistiques de base sur les tirages
 * @param {Array
} draws - Liste des tirages
 * @returns {Object} Statistiques de base
 */
const calculateBasicStats = (draws) => {
    if (!draws || draws.length === 0) {
        return {
            totalDraws: 0,
            avgJackpot: 0,
            maxJackpot: 0,
            minJackpot: 0,
            jackpotWonCount: 0,
            jackpotWonPercentage: 0
        };
    }
    
    // Calcul des statistiques sur les jackpots
    const jackpots = draws.map(draw => draw.jackpot).filter(j => j > 0);
    const jackpotSum = jackpots.reduce((sum, jackpot) => sum + jackpot, 0);
    const avgJackpot = jackpots.length > 0 ? jackpotSum / jackpots.length : 0;
    const maxJackpot = Math.max(...jackpots, 0);
    const minJackpot = Math.min(...jackpots.filter(j => j > 0), Infinity);
    
    // Calcul du nombre de jackpots gagnés
    const jackpotWonCount = draws.filter(draw => draw.winners && draw.winners > 0).length;
    const jackpotWonPercentage = (jackpotWonCount / draws.length) * 100;
    
    return {
        totalDraws: draws.length,
        avgJackpot,
        maxJackpot,
        minJackpot,
        jackpotWonCount,
        jackpotWonPercentage
    };
};

/**
 * Analyse les paires de numéros qui apparaissent ensemble fréquemment
 * @param {Array
} draws - Liste des tirages
 * @param {number} topCount - Nombre de paires à retourner
 * @returns {Array
} Les paires les plus fréquentes
 */
const analyzeNumberPairs = (draws, topCount = 10) => {
    if (!draws || draws.length === 0) {
        return [];
    }
    
    const pairCounts = {};
    
    // Compter les paires
    draws.forEach(draw => {
        const numbers = draw.numbers;
        
        // Générer toutes les combinaisons de paires possibles
        for (let i = 0; i < numbers.length; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                // Assurer que la paire est toujours dans le même ordre (le plus petit numéro en premier)
                const n1 = Math.min(numbers[i], numbers[j]);
                const n2 = Math.max(numbers[i], numbers[j]);
                const pairKey = `${n1}-${n2}`;
                
                if (!pairCounts[pairKey]) {
                    pairCounts[pairKey] = 0;
                }
                
                pairCounts[pairKey]++;
            }
        }
    });
    
    // Convertir en tableau et trier
    const pairArray = Object.entries(pairCounts)
        .map(([pair, count]) => {
            const [num1, num2] = pair.split('-').map(n => parseInt(n, 10));
            return { pair, num1, num2, count };
        })
        .sort((a, b) => b.count - a.count);
    
    return pairArray.slice(0, topCount);
};

/**
 * Analyse le ratio entre numéros pairs et impairs dans les tirages
 * @param {Array
} draws - Liste des tirages
 * @returns {Object} Statistiques sur les ratios pairs/impairs
 */
const analyzeOddEvenRatio = (draws) => {
    if (!draws || draws.length === 0) {
        return {
            distribution: {},
            mostFrequent: { odd: 0, even: 0, count: 0, percentage: 0 }
        };
    }
    
    const distribution = {};
    
    // Calculer la distribution
    draws.forEach(draw => {
        const numbers = draw.numbers;
        
        // Compter les numéros pairs et impairs
        const oddCount = numbers.filter(n => n % 2 !== 0).length;
        const evenCount = numbers.length - oddCount;
        
        // Créer la clé pour cette distribution
        const key = `${oddCount}-${evenCount}`;
        
        if (!distribution[key]) {
            distribution[key] = 0;
        }
        
        distribution[key]++;
    });
    
    // Trouver la distribution la plus fréquente
    let mostFrequentKey = '';
    let maxCount = 0;
    
    Object.entries(distribution).forEach(([key, count]) => {
        if (count > maxCount) {
            mostFrequentKey = key;
            maxCount = count;
        }
    });
    
    // Extraire les valeurs de la clé la plus fréquente
    const [odd, even] = mostFrequentKey.split('-').map(n => parseInt(n, 10));
    
    return {
        distribution,
        mostFrequent: {
            odd,
            even,
            count: maxCount,
            percentage: (maxCount / draws.length) * 100
        }
    };
};

/**
 * Analyse les tirages pour identifier les tendances
 * @param {Array
} draws - Liste des tirages
 * @returns {Object} Analyse des tendances
 */
const analyzeTrends = (draws) => {
    if (!draws || draws.length === 0) {
        return {
            jackpotTrend: [],
            recentHotNumbers: { numbers: [], stars: [] },
            recentColdNumbers: { numbers: [], stars: [] }
        };
    }
    
    // Tri des tirages par date (du plus récent au plus ancien)
    const sortedDraws = [...draws].sort((a, b) => 
        new Date(b.draw_date) - new Date(a.draw_date)
    );
    
    // Tendance des jackpots (10 derniers tirages)
    const jackpotTrend = sortedDraws.slice(0, 10)
        .map(draw => ({
            date: draw.draw_date,
            jackpot: draw.jackpot,
            won: draw.winners > 0
        }))
        .reverse(); // Remettre dans l'ordre chronologique
    
    // Numéros chauds/froids sur les 20 derniers tirages
    const recentDraws = sortedDraws.slice(0, 20);
    const recentFreq = calculateFrequencies(recentDraws);
    
    const recentHotNumbers = getHotNumbers(recentFreq);
    const recentColdNumbers = getColdNumbers(recentFreq);
    
    return {
        jackpotTrend,
        recentHotNumbers,
        recentColdNumbers
    };
};

/**
 * Calcule des statistiques avancées sur les tirages
 * @returns {Promise
} Statistiques complètes
 */
const getFullStatistics = async () => {
    try {
        logger.info('Calcul des statistiques complètes...');
        
        const draws = await Draw.findAll();
        
        if (!draws || draws.length === 0) {
            logger.warn('Aucun tirage disponible pour le calcul des statistiques');
            return {
                basicStats: { totalDraws: 0 },
                frequencies: { numbers: {}, stars: {}, totalDraws: 0 },
                hotNumbers: { numbers: [], stars: [] },
                coldNumbers: { numbers: [], stars: [] },
                oddEvenAnalysis: { distribution: {}, mostFrequent: { odd: 0, even: 0 } },
                numberPairs: [],
                trends: { jackpotTrend: [], recentHotNumbers: { numbers: [], stars: [] } }
            };
        }
        
        // Calcul des fréquences
        const frequencies = calculateFrequencies(draws);
        
        // Numéros chauds et froids
        const hotNumbers = getHotNumbers(frequencies);
        const coldNumbers = getColdNumbers(frequencies);
        
        // Statistiques de base
        const basicStats = calculateBasicStats(draws);
        
        // Analyse des paires
        const numberPairs = analyzeNumberPairs(draws);
        
        // Analyse pair/impair
        const oddEvenAnalysis = analyzeOddEvenRatio(draws);
        
        // Analyse des tendances
        const trends = analyzeTrends(draws);
        
        logger.info(`Statistiques calculées sur ${draws.length} tirages`);
        
        return {
            basicStats,
            frequencies,
            hotNumbers,
            coldNumbers,
            oddEvenAnalysis,
            numberPairs,
            trends
        };
    } catch (error) {
        logger.error('Erreur lors du calcul des statistiques:', error);
        throw error;
    }
};

/**
 * Obtient les numéros les plus retardés (qui n'ont pas été tirés depuis longtemps)
 * @param {number} numbersCount - Nombre de numéros à retourner
 * @param {number} starsCount - Nombre d'étoiles à retourner
 * @returns {Promise
} Les numéros et étoiles les plus retardés
 */
const getOverdueNumbers = async (numbersCount = 5, starsCount = 2) => {
    try {
        logger.info('Calcul des numéros retardés...');
        
        const draws = await Draw.findAll();
        
        if (!draws || draws.length === 0) {
            logger.warn('Aucun tirage disponible pour calculer les numéros retardés');
            return { numbers: [], stars: [] };
        }
        
        // Tri des tirages par date (du plus récent au plus ancien)
        const sortedDraws = [...draws].sort((a, b) => 
            new Date(b.draw_date) - new Date(a.draw_date)
        );
        
        // Initialisation des compteurs pour chaque numéro/étoile
        const numbersDroughtCounter = {};
        const starsDroughtCounter = {};
        
        for (let i = 1; i <= 50; i++) {
            numbersDroughtCounter[i] = 0;
        }
        
        for (let i = 1; i <= 12; i++) {
            starsDroughtCounter[i] = 0;
        }
        
        // Déterminer les numéros présents dans chaque tirage
        let allNumbersFound = false;
        let allStarsFound = false;
        
        for (const draw of sortedDraws) {
            // Si on a trouvé tous les numéros et étoiles, on s'arrête
            if (allNumbersFound && allStarsFound) {
                break;
            }
            
            // Traitement des numéros
            if (!allNumbersFound) {
                draw.numbers.forEach(num => {
                    // Si le numéro n'a pas encore été trouvé, on marque qu'il a été trouvé
                    if (numbersDroughtCounter[num] === 0) {
                        numbersDroughtCounter[num] = -1; // Marquer comme trouvé
                    }
                });
                
                // Incrémenter le compteur pour tous les numéros non trouvés
                for (let i = 1; i <= 50; i++) {
                    if (numbersDroughtCounter[i] >= 0) {
                        numbersDroughtCounter[i]++;
                    }
                }
                
                // Vérifier si tous les numéros ont été trouvés
                allNumbersFound = Object.values(numbersDroughtCounter).every(val => val === -1);
            }
            
            // Traitement des étoiles
            if (!allStarsFound) {
                draw.stars.forEach(star => {
                    if (starsDroughtCounter[star] === 0) {
                        starsDroughtCounter[star] = -1;
                    }
                });
                
                // Incrémenter le compteur pour toutes les étoiles non trouvées
                for (let i = 1; i <= 12; i++) {
                    if (starsDroughtCounter[i] >= 0) {
                        starsDroughtCounter[i]++;
                    }
                }
                
                // Vérifier si toutes les étoiles ont été trouvées
                allStarsFound = Object.values(starsDroughtCounter).every(val => val === -1);
            }
        }
        
        // Convertir les marqueurs -1 en 0 (pour les numéros/étoiles trouvés dans le dernier tirage)
        for (let i = 1; i <= 50; i++) {
            if (numbersDroughtCounter[i] === -1) {
                numbersDroughtCounter[i] = 0;
            }
        }
        
        for (let i = 1; i <= 12; i++) {
            if (starsDroughtCounter[i] === -1) {
                starsDroughtCounter[i] = 0;
            }
        }
        
        // Trier les numéros et étoiles par durée de sécheresse
        const sortedNumbers = Object.entries(numbersDroughtCounter)
            .sort((a, b) => b[1] - a[1])
            .slice(0, numbersCount)
            .map(entry => parseInt(entry[0], 10));
        
        const sortedStars = Object.entries(starsDroughtCounter)
            .sort((a, b) => b[1] - a[1])
            .slice(0, starsCount)
            .map(entry => parseInt(entry[0], 10));
        
        logger.info('Calcul des numéros retardés terminé');
        
        return {
            numbers: sortedNumbers,
            stars: sortedStars
        };
    } catch (error) {
        logger.error('Erreur lors du calcul des numéros retardés:', error);
        throw error;
    }
};

/**
 * Vérifie si une combinaison de numéros est déjà sortie dans le passé
 * @param {Array} numbers - Liste des numéros à vérifier
 * @param {Array} stars - Liste des étoiles à vérifier
 * @returns {Promise
} Résultat de la vérification
 */
const checkCombination = async (numbers, stars) => {
    try {
        logger.info(`Vérification de la combinaison: ${numbers.join(',')} - ${stars.join(',')}`);
        
        // Validation des entrées
        if (!numbers || numbers.length !== 5 || !stars || stars.length !== 2) {
            throw new Error('La combinaison doit contenir exactement 5 numéros et 2 étoiles');
        }
        
        // Vérifier que les numéros sont valides
        const validNumbers = numbers.every(n => n >= 1 && n <= 50 && Number.isInteger(n));
        const validStars = stars.every(s => s >= 1 && s <= 12 && Number.isInteger(s));
        
        if (!validNumbers || !validStars) {
            throw new Error('Numéros invalides. Les numéros doivent être entre 1-50 et les étoiles entre 1-12');
        }
        
        const draws = await Draw.findAll();
        
        if (!draws || draws.length === 0) {
            return { 
                hasExactMatch: false, 
                partialMatches: [], 
                numbersMatches: 0, 
                starsMatches: 0 
            };
        }
        
        let exactMatch = null;
        const partialMatches = [];
        let maxNumbersMatched = 0;
        let maxStarsMatched = 0;
        
        // Tri des numéros pour faciliter la comparaison
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        const sortedStars = [...stars].sort((a, b) => a - b);
        
        for (const draw of draws) {
            // Tri des numéros du tirage
            const drawNumbers = [...draw.numbers].sort((a, b) => a - b);
            const drawStars = [...draw.stars].sort((a, b) => a - b);
            
            // Vérifier si c'est une correspondance exacte
            const exactNumbersMatch = JSON.stringify(sortedNumbers) === JSON.stringify(drawNumbers);
            const exactStarsMatch = JSON.stringify(sortedStars) === JSON.stringify(drawStars);
            
            if (exactNumbersMatch && exactStarsMatch) {
                exactMatch = draw;
                break;
            }
            
            // Compter les correspondances partielles
            const numbersMatched = sortedNumbers.filter(n => drawNumbers.includes(n)).length;
            const starsMatched = sortedStars.filter(s => drawStars.includes(s)).length;
            
            // Mettre à jour les maximums
            maxNumbersMatched = Math.max(maxNumbersMatched, numbersMatched);
            maxStarsMatched = Math.max(maxStarsMatched, starsMatched);
            
            // Enregistrer les correspondances partielles significatives (au moins 2 numéros et 1 étoile)
            if (numbersMatched >= 2 && starsMatched >= 1) {
                partialMatches.push({
                    draw,
                    numbersMatched,
                    starsMatched,
                    totalMatched: numbersMatched + starsMatched
                });
            }
        }
        
        // Trier les correspondances partielles par nombre total de correspondances
        partialMatches.sort((a, b) => b.totalMatched - a.totalMatched);
        
        // Limiter le nombre de correspondances partielles retournées
        const limitedPartialMatches = partialMatches.slice(0, 5);
        
        logger.info(`Vérification terminée: ${exactMatch ? 'Combinaison déjà sortie' : 'Combinaison jamais sortie'}`);
        
        return {
            hasExactMatch: !!exactMatch,
            exactMatch,
            partialMatches: limitedPartialMatches,
            maxNumbersMatched,
            maxStarsMatched
        };
    } catch (error) {
        logger.error('Erreur lors de la vérification de la combinaison:', error);
        throw error;
    }
};

/**
 * Analyse les sommes des numéros et leurs distributions
 * @returns {Promise
} Analyse des sommes
 */
const analyzeSums = async () => {
    try {
        logger.info('Analyse des sommes des numéros...');
        
        const draws = await Draw.findAll();
        
        if (!draws || draws.length === 0) {
            logger.warn('Aucun tirage disponible pour l\'analyse des sommes');
            return {
                numbersSums: { min: 0, max: 0, avg: 0, distribution: {} },
                starsSums: { min: 0, max: 0, avg: 0, distribution: {} }
            };
        }
        
        const numbersSums = [];
        const starsSums = [];
        const numbersSumsDistribution = {};
        const starsSumsDistribution = {};
        
        // Calculer les sommes pour chaque tirage
        for (const draw of draws) {
            const numbersSum = draw.numbers.reduce((sum, n) => sum + n, 0);
            const starsSum = draw.stars.reduce((sum, s) => sum + s, 0);
            
            numbersSums.push(numbersSum);
            starsSums.push(starsSum);
            
            // Incrémenter le compteur pour cette somme
            numbersSumsDistribution[numbersSum] = (numbersSumsDistribution[numbersSum] || 0) + 1;
            starsSumsDistribution[starsSum] = (starsSumsDistribution[starsSum] || 0) + 1;
        }
        
        // Calculer les statistiques sur les sommes des numéros
        const minNumbersSum = Math.min(...numbersSums);
        const maxNumbersSum = Math.max(...numbersSums);
        const avgNumbersSum = numbersSums.reduce((sum, n) => sum + n, 0) / numbersSums.length;
        
        // Calculer les statistiques sur les sommes des étoiles
        const minStarsSum = Math.min(...starsSums);
        const maxStarsSum = Math.max(...starsSums);
        const avgStarsSum = starsSums.reduce((sum, s) => sum + s, 0) / starsSums.length;
        
        // Trouver les plages de sommes les plus fréquentes
        const numbersSumRanges = {
            '1-100': 0,
            '101-125': 0,
            '126-150': 0,
            '151-175': 0,
            '176-200': 0,
            '201-250': 0
        };
        
        numbersSums.forEach(sum => {
            if (sum <= 100) numbersSumRanges['1-100']++;
            else if (sum <= 125) numbersSumRanges['101-125']++;
            else if (sum <= 150) numbersSumRanges['126-150']++;
            else if (sum <= 175) numbersSumRanges['151-175']++;
            else if (sum <= 200) numbersSumRanges['176-200']++;
            else numbersSumRanges['201-250']++;
        });
        
        const starsSumRanges = {
            '1-5': 0,
            '6-10': 0,
            '11-15': 0,
            '16-20': 0,
            '21-24': 0
        };
        
        starsSums.forEach(sum => {
            if (sum <= 5) starsSumRanges['1-5']++;
            else if (sum <= 10) starsSumRanges['6-10']++;
            else if (sum <= 15) starsSumRanges['11-15']++;
            else if (sum <= 20) starsSumRanges['16-20']++;
            else starsSumRanges['21-24']++;
        });
        
        logger.info('Analyse des sommes terminée');
        
        return {
            numbersSums: {
                min: minNumbersSum,
                max: maxNumbersSum,
                avg: avgNumbersSum,
                distribution: numbersSumsDistribution,
                ranges: numbersSumRanges
            },
            starsSums: {
                min: minStarsSum,
                max: maxStarsSum,
                avg: avgStarsSum,
                distribution: starsSumsDistribution,
                ranges: starsSumRanges
            }
        };
    } catch (error) {
        logger.error('Erreur lors de l\'analyse des sommes:', error);
        throw error;
    }
};

module.exports = {
    calculateFrequencies,
    getHotNumbers,
    getColdNumbers,
    calculateDelays,
    calculateBasicStats,
    analyzeNumberPairs,
    analyzeOddEvenRatio,
    analyzeTrends,
    getFullStatistics,
    getOverdueNumbers,
    checkCombination,
    analyzeSums
};
