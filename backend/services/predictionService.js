/**
 * Service de prédiction pour l'EuroMillions
 * Fournit des méthodes pour générer des prédictions et des grilles
 */

const analysisService = require('./analysisService');
const Draw = require('../models/drawModel');
const logger = require('../utils/logger');

/**
 * Génère une grille aléatoire
 * @returns {Object} Une grille avec 5 numéros et 2 étoiles
 */
const generateRandomGrid = () => {
    const numbers = [];
    const stars = [];
    
    // Générer 5 numéros uniques entre 1 et 50
    while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 50) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    
    // Générer 2 étoiles uniques entre 1 et 12
    while (stars.length < 2) {
        const star = Math.floor(Math.random() * 12) + 1;
        if (!stars.includes(star)) {
            stars.push(star);
        }
    }
    
    // Tri des numéros et étoiles pour faciliter la lecture
    numbers.sort((a, b) => a - b);
    stars.sort((a, b) => a - b);
    
    return { numbers, stars };
};

/**
 * Génère une grille basée sur les fréquences d'apparition
 * @returns {Promise
} Une grille avec 5 numéros et 2 étoiles
 */
const generateFrequencyBasedGrid = async () => {
    try {
        const draws = await Draw.findAll();
        
        if (!draws || draws.length === 0) {
            logger.warn('Aucun tirage disponible pour la génération de grille basée sur les fréquences');
            return generateRandomGrid();
        }
        
        const frequencies = analysisService.calculateFrequencies(draws);
        
        // Convertir les fréquences en probabilités
        const numbersProbabilities = {};
        const starsProbabilities = {};
        
        // Normaliser les fréquences pour les numéros
        let totalNumbersFreq = 0;
        for (let i = 1; i <= 50; i++) {
            totalNumbersFreq += frequencies.numbers[i];
        }
        
        for (let i = 1; i <= 50; i++) {
            numbersProbabilities[i] = frequencies.numbers[i] / totalNumbersFreq;
        }
        
        // Normaliser les fréquences pour les étoiles
        let totalStarsFreq = 0;
        for (let i = 1; i <= 12; i++) {
            totalStarsFreq += frequencies.stars[i];
        }
        
        for (let i = 1; i <= 12; i++) {
            starsProbabilities[i] = frequencies.stars[i] / totalStarsFreq;
        }
        
        // Effectuer une sélection pondérée
        const numbers = weightedSelection(numbersProbabilities, 5);
        const stars = weightedSelection(starsProbabilities, 2);
        
        // Tri des numéros et étoiles
        numbers.sort((a, b) => a - b);
        stars.sort((a, b) => a - b);
        
        return { numbers, stars };
    } catch (error) {
        logger.error('Erreur lors de la génération de grille basée sur les fréquences:', error);
        // En cas d'erreur, on retourne une grille aléatoire
        return generateRandomGrid();
    }
};

/**
 * Utilitaire pour effectuer une sélection pondérée
 * @param {Object} probabilities - Probabilités pour chaque élément
 * @param {number} count - Nombre d'éléments à sélectionner
 * @returns {Array} Éléments sélectionnés
 */
const weightedSelection = (probabilities, count) => {
    const selected = [];
    const entries = Object.entries(probabilities);
    
    // Copie des probabilities pour pouvoir les modifier
    const remainingProbs = { ...probabilities };
    
    while (selected.length < count) {
        // Calculer la somme des probabilités restantes
        let sum = 0;
        for (const key in remainingProbs) {
            if (!selected.includes(parseInt(key, 10))) {
                sum += remainingProbs[key];
            }
        }
        
        // Générer un nombre aléatoire entre 0 et la somme
        const rand = Math.random() * sum;
        
        // Sélectionner un élément basé sur le nombre aléatoire
        let currentSum = 0;
        for (const [key, prob] of entries) {
            const num = parseInt(key, 10);
            if (!selected.includes(num)) {
                currentSum += remainingProbs[key];
                if (rand <= currentSum) {
                    selected.push(num);
                    delete remainingProbs[key]; // Supprimer l'élément sélectionné
                    break;
                }
            }
        }
    }
    
    return selected;
};

/**
 * Génère une grille basée sur les numéros "chauds" (les plus fréquents)
 * @returns {Promise
} Une grille avec 5 numéros et 2 étoiles
 */
const generateHotNumbersGrid = async () => {
    try {
        const stats = await analysisService.getFullStatistics();
        
        // Si aucune statistique n'est disponible, générer une grille aléatoire
        if (!stats || !stats.hotNumbers) {
            logger.warn('Aucune statistique disponible pour la génération de grille par numéros chauds');
            return generateRandomGrid();
        }
        
        // On a déjà les 5 numéros et 2 étoiles les plus fréquents
        const numbers = stats.hotNumbers.numbers;
        const stars = stats.hotNumbers.stars;
        
        return { numbers, stars };
    } catch (error) {
        logger.error('Erreur lors de la génération de grille par numéros chauds:', error);
        return generateRandomGrid();
    }
};

/**
 * Génère une grille basée sur les numéros "froids" (les moins fréquents)
 * @returns {Promise
} Une grille avec 5 numéros et 2 étoiles
 */
const generateColdNumbersGrid = async () => {
    try {
        const stats = await analysisService.getFullStatistics();
        
        // Si aucune statistique n'est disponible, générer une grille aléatoire
        if (!stats || !stats.coldNumbers) {
            logger.warn('Aucune statistique disponible pour la génération de grille par numéros froids');
            return generateRandomGrid();
        }
        
        // On a déjà les 5 numéros et 2 étoiles les moins fréquents
        const numbers = stats.coldNumbers.numbers;
        const stars = stats.coldNumbers.stars;
        
        return { numbers, stars };
    } catch (error) {
        logger.error('Erreur lors de la génération de grille par numéros froids:', error);
        return generateRandomGrid();
    }
};

/**
 * Génère une grille basée sur les numéros qui n'ont pas été tirés depuis longtemps
 * @returns {Promise
} Une grille avec 5 numéros et 2 étoiles
 */
const generateOverdueNumbersGrid = async () => {
    try {
        const overdueNumbers = await analysisService.getOverdueNumbers(5, 2);
        
        // Si aucun numéro retardé n'est disponible, générer une grille aléatoire
        if (!overdueNumbers || !overdueNumbers.numbers || overdueNumbers.numbers.length < 5) {
            logger.warn('Aucun numéro retardé disponible pour la génération de grille');
            return generateRandomGrid();
        }
        
        const numbers = overdueNumbers.numbers;
        const stars = overdueNumbers.stars;
        
        return { numbers, stars };
    } catch (error) {
        logger.error('Erreur lors de la génération de grille par numéros retardés:', error);
        return generateRandomGrid();
    }
};

/**
 * Génère une grille combinant plusieurs stratégies
 * @returns {Promise
} Une grille avec 5 numéros et 2 étoiles
 */
const generateHybridGrid = async () => {
    try {
        const draws = await Draw.findAll();
        
        if (!draws || draws.length === 0) {
            logger.warn('Aucun tirage disponible pour la génération de grille hybride');
            return generateRandomGrid();
        }
        
        // Récupérer les statistiques nécessaires
        const frequencies = analysisService.calculateFrequencies(draws);
        const overdueNumbers = await analysisService.getOverdueNumbers(10, 4);
        
        // Créer un système de points pour chaque numéro
        const numbersScores = {};
        const starsScores = {};
        
        // Initialiser les scores
        for (let i = 1; i <= 50; i++) {
            numbersScores[i] = 0;
        }
        
        for (let i = 1; i <= 12; i++) {
            starsScores[i] = 0;
        }
        
        // Ajouter des points basés sur la fréquence (max 100 points)
        for (let i = 1; i <= 50; i++) {
            const freq = frequencies.numbers[i] / frequencies.totalDraws;
            numbersScores[i] += freq * 100;
        }
        
        for (let i = 1; i <= 12; i++) {
            const freq = frequencies.stars[i] / frequencies.totalDraws;
            starsScores[i] += freq * 100;
        }
        
        // Ajouter des points pour les numéros retardés (plus ils sont retardés, plus ils ont de points)
        // Maximum 50 points pour ce critère
        overdueNumbers.numbers.forEach((num, index) => {
            const points = 50 - (index * 5); // 50, 45, 40, ...
            if (points > 0) {
                numbersScores[num] += points;
            }
        });
        
        overdueNumbers.stars.forEach((star, index) => {
            const points = 50 - (index * 12.5); // 50, 37.5, 25, 12.5
            if (points > 0) {
                starsScores[star] += points;
            }
        });
        
        // Ajouter un facteur aléatoire (max 25 points)
        for (let i = 1; i <= 50; i++) {
            numbersScores[i] += Math.random() * 25;
        }
        
        for (let i = 1; i <= 12; i++) {
            starsScores[i] += Math.random() * 25;
        }
        
        // Trier par score et prendre les meilleurs
        const sortedNumbers = Object.entries(numbersScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => parseInt(entry[0], 10));
        
        const sortedStars = Object.entries(starsScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(entry => parseInt(entry[0], 10));
        
        // Tri des numéros et étoiles
        sortedNumbers.sort((a, b) => a - b);
        sortedStars.sort((a, b) => a - b);
        
        return { numbers: sortedNumbers, stars: sortedStars };
    } catch (error) {
        logger.error('Erreur lors de la génération de grille hybride:', error);
        return generateRandomGrid();
    }
};

/**
 * Génère une grille avec des numéros et étoiles spécifiquement exclus
 * @param {Array} excludedNumbers - Numéros à exclure
 * @param {Array} excludedStars - Étoiles à exclure
 * @returns {Promise
} Une grille avec 5 numéros et 2 étoiles
 */
const generateGridWithExclusions = async (excludedNumbers = [], excludedStars = []) => {
    try {
        // Validation des entrées
        if (!Array.isArray(excludedNumbers) || !Array.isArray(excludedStars)) {
            throw new Error('Les paramètres doivent être des tableaux');
        }
        
        // Convertir les entrées en nombres
        const excludedNums = excludedNumbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        const excludedSts = excludedStars.map(s => parseInt(s, 10)).filter(s => !isNaN(s));
        
        // Vérifier que les valeurs sont dans les plages valides
        const validExcludedNums = excludedNums.filter(n => n >= 1 && n <= 50);
        const validExcludedStars = excludedSts.filter(s => s >= 1 && s <= 12);
        
        // Vérifier qu'il reste assez de numéros/étoiles disponibles
        if (validExcludedNums.length >= 46) { // 50 - 5 + 1
            throw new Error('Trop de numéros exclus, il doit rester au moins 5 numéros disponibles');
        }
        
        if (validExcludedStars.length >= 11) { // 12 - 2 + 1
            throw new Error('Trop d\'étoiles exclues, il doit rester au moins 2 étoiles disponibles');
        }
        
        // Générer une grille basée sur les fréquences
        const baseGrid = await generateFrequencyBasedGrid();
        
        // Remplacer les numéros exclus
        const numbers = [];
        for (const num of baseGrid.numbers) {
            if (validExcludedNums.includes(num)) {
                // Trouver un numéro non exclu qui n'est pas déjà dans la sélection
                let replacement;
                do {
                    replacement = Math.floor(Math.random() * 50) + 1;
                } while (
                    validExcludedNums.includes(replacement) || 
                    numbers.includes(replacement)
                );
                
                numbers.push(replacement);
            } else {
                numbers.push(num);
            }
        }
        
        // Remplacer les étoiles exclues
        const stars = [];
        for (const star of baseGrid.stars) {
            if (validExcludedStars.includes(star)) {
                // Trouver une étoile non exclue qui n'est pas déjà dans la sélection
                let replacement;
                do {
                    replacement = Math.floor(Math.random() * 12) + 1;
                } while (
                    validExcludedStars.includes(replacement) || 
                    stars.includes(replacement)
                );
                
                stars.push(replacement);
            } else {
                stars.push(star);
            }
        }
        
        // Tri des numéros et étoiles
        numbers.sort((a, b) => a - b);
        stars.sort((a, b) => a - b);
        
        return { numbers, stars };
    } catch (error) {
        logger.error('Erreur lors de la génération de grille avec exclusions:', error);
        return generateRandomGrid();
    }
};

/**
 * Génère plusieurs grilles avec différentes stratégies
 * @param {number} count - Nombre de grilles à générer
 * @returns {Promise>} Liste de grilles
 */
const generateMultipleGrids = async (count = 5) => {
    try {
        // Valider le paramètre
        const gridCount = parseInt(count, 10);
        
        if (isNaN(gridCount) || gridCount < 1 || gridCount > 10) {
            throw new Error('Le nombre de grilles doit être entre 1 et 10');
        }
        
        const grids = [];
        
        // Générer les grilles avec différentes stratégies
        const strategies = [
            { name: 'random', generator: generateRandomGrid },
            { name: 'frequency', generator: generateFrequencyBasedGrid },
            { name: 'hot', generator: generateHotNumbersGrid },
            { name: 'cold', generator: generateColdNumbersGrid },
            { name: 'overdue', generator: generateOverdueNumbersGrid },
            { name: 'hybrid', generator: generateHybridGrid }
        ];
        
        // Si on demande moins de grilles que le nombre de stratégies, on privilégie les stratégies avancées
        const selectedStrategies = strategies.slice(-gridCount);
        
        // Générer les grilles
        for (const strategy of selectedStrategies) {
            const grid = await strategy.generator();
            grids.push({
                ...grid,
                strategy: strategy.name
            });
        }
        
        // Si on a demandé plus de grilles que le nombre de stratégies disponibles,
        // on génère des grilles hybrides supplémentaires
        for (let i = strategies.length; i < gridCount; i++) {
            const grid = await generateHybridGrid();
            grids.push({
                ...grid,
                strategy: 'hybrid'
            });
        }
        
        return grids;
    } catch (error) {
        logger.error('Erreur lors de la génération de multiples grilles:', error);
        throw error;
    }
};

/**
 * Prédit le prochain tirage en utilisant une méthode spécifique
 * @param {string} method - Méthode de prédiction (weighted_random, hot_numbers, cold_numbers, balanced)
 * @returns {Promise
} Prédiction pour le prochain tirage
 */
const predictNextDraw = async (method = 'weighted_random') => {
    try {
        let prediction;
        let confidence = 0;
        
        switch (method.toLowerCase()) {
            case 'hot_numbers':
                prediction = await generateHotNumbersGrid();
                confidence = 0.58;
                break;
                
            case 'cold_numbers':
                prediction = await generateColdNumbersGrid();
                confidence = 0.45;
                break;
                
            case 'balanced':
                prediction = await generateHybridGrid();
                confidence = 0.52;
                break;
                
            case 'weighted_random':
            default:
                prediction = await generateFrequencyBasedGrid();
                confidence = 0.65;
                break;
        }
        
        return {
            prediction,
            method,
            confidence,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error(`Erreur lors de la prédiction avec méthode ${method}:`, error);
        throw error;
    }
};

/**
 * Génère un ensemble de prédictions avec différentes méthodes
 * @returns {Promise>} Liste de prédictions
 */
const getAllPredictions = async () => {
    try {
        const methods = ['weighted_random', 'hot_numbers', 'cold_numbers', 'balanced'];
        const predictions = [];
        
        for (const method of methods) {
            const prediction = await predictNextDraw(method);
            predictions.push(prediction);
        }
        
        return predictions;
    } catch (error) {
        logger.error('Erreur lors de la génération de toutes les prédictions:', error);
        throw error;
    }
};

/**
 * Vérifie les résultats des prédictions précédentes
 * @param {Array
} predictions - Liste de prédictions à vérifier
 * @returns {Promise
} Résultats des vérifications
 */
const evaluatePredictions = async (predictions) => {
    try {
        // Si aucune prédiction n'est fournie, utiliser les prédictions par défaut
        if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
            predictions = await getAllPredictions();
        }
        
        // Récupérer le dernier tirage
        const latestDraw = await Draw.findLatest();
        
        if (!latestDraw) {
            throw new Error('Aucun tirage disponible pour évaluer les prédictions');
        }
        
        const results = [];
        
        // Évaluer chaque prédiction
        for (const prediction of predictions) {
            const { prediction: { numbers, stars }, method } = prediction;
            
            // Compter les correspondances
            const numbersMatched = numbers.filter(n => latestDraw.numbers.includes(n)).length;
            const starsMatched = stars.filter(s => latestDraw.stars.includes(s)).length;
            
            results.push({
                method,
                numbers,
                stars,
                numbersMatched,
                starsMatched,
                totalMatched: numbersMatched + starsMatched,
                latestDraw
            });
        }
        
        // Trier par nombre total de correspondances
        results.sort((a, b) => b.totalMatched - a.totalMatched);
        
        return {
            evaluationDate: new Date().toISOString(),
            latestDrawDate: latestDraw.draw_date,
            results
        };
    } catch (error) {
        logger.error('Erreur lors de l\'évaluation des prédictions:', error);
        throw error;
    }
};

/**
 * Simule les gains potentiels pour une grille donnée
 * @param {Object} grid - Grille à évaluer
 * @returns {Promise
} Estimation des gains potentiels
 */
const simulateWinnings = async (grid) => {
    try {
        // Validation de la grille
        if (!grid || !grid.numbers || !grid.stars || 
            grid.numbers.length !== 5 || grid.stars.length !== 2) {
            throw new Error('Grille invalide. Elle doit contenir 5 numéros et 2 étoiles');
        }
        
        // Récupérer les statistiques de base
        const stats = await analysisService.getFullStatistics();
        
        if (!stats || !stats.basicStats) {
            throw new Error('Aucune statistique disponible pour la simulation');
        }
        
        // Calculer les probabilités de gain
        // Probabilités approximatives pour chaque catégorie de prix EuroMillions
        const probabilities = {
            '5+2': 1 / 139838160,    // 5 numéros + 2 étoiles (jackpot)
            '5+1': 1 / 6991908,      // 5 numéros + 1 étoile
            '5+0': 1 / 3107515,      // 5 numéros
            '4+2': 1 / 621503,       // 4 numéros + 2 étoiles
            '4+1': 1 / 31076,        // 4 numéros + 1 étoile
            '3+2': 1 / 14126,        // 3 numéros + 2 étoiles
            '4+0': 1 / 13812,        // 4 numéros
            '2+2': 1 / 986,          // 2 numéros + 2 étoiles
            '3+1': 1 / 707,          // 3 numéros + 1 étoile
            '3+0': 1 / 314,          // 3 numéros
            '1+2': 1 / 188,          // 1 numéro + 2 étoiles
            '2+1': 1 / 50,           // 2 numéros + 1 étoile
            '2+0': 1 / 22            // 2 numéros
        };
        
        // Montants moyens des gains par catégorie (en euros)
        const averageAmounts = {
            '5+2': stats.basicStats.avgJackpot || 17000000,  // Jackpot moyen
            '5+1': 500000,
            '5+0': 100000,
            '4+2': 5000,
            '4+1': 200,
            '3+2': 100,
            '4+0': 80,
            '2+2': 20,
            '3+1': 15,
            '3+0': 13,
            '1+2': 10,
            '2+1': 8,
            '2+0': 4
        };
        
        // Calculer l'espérance mathématique (gain moyen sur une longue période)
        let expectedValue = 0;
        
        for (const category in probabilities) {
            expectedValue += probabilities[category] * averageAmounts[category];
        }
        
        // Calculer la probabilité de gagner quelque chose
        const winProbability = (1 / 13) + (1 / 50) + (1 / 314) + (1 / 707) + (1 / 986) + 
                               (1 / 13812) + (1 / 14126) + (1 / 31076) + (1 / 621503) + 
                               (1 / 3107515) + (1 / 6991908) + (1 / 139838160);
        
        // Évaluer la qualité de la grille
        const gridQuality = await evaluateGridQuality(grid);
        
        return {
            grid,
            expectedValue: parseFloat(expectedValue.toFixed(2)),
            winProbability: winProbability,
            winPercentage: parseFloat((winProbability * 100).toFixed(4)),
            jackpotProbability: probabilities['5+2'],
            qualityScore: gridQuality.score,
            qualityRating: gridQuality.rating,
            categories: Object.keys(probabilities).map(category => ({
                category,
                probability: probabilities[category],
                averageAmount: averageAmounts[category]
            }))
        };
    } catch (error) {
        logger.error('Erreur lors de la simulation des gains:', error);
        throw error;
    }
};

/**
 * Évalue la qualité d'une grille en fonction des statistiques historiques
 * @param {Object} grid - Grille à évaluer
 * @returns {Promise
} Score de qualité et évaluation
 */
const evaluateGridQuality = async (grid) => {
    try {
        const draws = await Draw.findAll({ limit: 100 }); // Utiliser les 100 derniers tirages
        
        if (!draws || draws.length === 0) {
            return { score: 50, rating: 'Moyenne' };
        }
        
        // Calculer les fréquences sur les 100 derniers tirages
        const frequencies = analysisService.calculateFrequencies(draws);
        
        // Calculer le score pour les numéros
        let numbersScore = 0;
        for (const num of grid.numbers) {
            const frequency = frequencies.numbers[num] / frequencies.totalDraws;
            numbersScore += frequency * 100; // Convertir en score sur 100
        }
        
        // Normaliser le score des numéros (max théorique = 5)
        numbersScore = (numbersScore / 5) * 0.7; // Les numéros comptent pour 70% du score
        
        // Calculer le score pour les étoiles
        let starsScore = 0;
        for (const star of grid.stars) {
            const frequency = frequencies.stars[star] / frequencies.totalDraws;
            starsScore += frequency * 100;
        }
        
        // Normaliser le score des étoiles (max théorique = 2)
        starsScore = (starsScore / 2) * 0.3; // Les étoiles comptent pour 30% du score
        
        // Score total
        const totalScore = numbersScore + starsScore;
        
        // Évaluation qualitative
        let rating = 'Moyenne';
        if (totalScore >= 80) rating = 'Excellente';
        else if (totalScore >= 70) rating = 'Très bonne';
        else if (totalScore >= 60) rating = 'Bonne';
        else if (totalScore >= 50) rating = 'Moyenne';
        else if (totalScore >= 40) rating = 'Faible';
        else rating = 'Très faible';
        
        return {
            score: parseFloat(totalScore.toFixed(2)),
            rating
        };
    } catch (error) {
        logger.error('Erreur lors de l\'évaluation de la qualité de la grille:', error);
        return { score: 50, rating: 'Moyenne' };
    }
};

module.exports = {
    generateRandomGrid,
    generateFrequencyBasedGrid,
    generateHotNumbersGrid,
    generateColdNumbersGrid,
    generateOverdueNumbersGrid,
    generateHybridGrid,
    generateGridWithExclusions,
    generateMultipleGrids,
    predictNextDraw,
    getAllPredictions,
    evaluatePredictions,
    simulateWinnings,
    evaluateGridQuality
};