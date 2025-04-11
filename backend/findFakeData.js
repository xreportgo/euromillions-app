// backend/findFakeData.js
const fs = require('fs');
const path = require('path');

// Patterns qui pourraient indiquer des données fictives
const fakeDataPatterns = [
  /\[\s*5\s*,\s*17\s*,\s*23\s*,\s*34\s*,\s*42\s*\]/,
  /\[\s*4\s*,\s*11\s*\]/,
  /"date"\s*:\s*"2025/,
  /'date'\s*:\s*'2025/,
  /date:\s*['"]2025/,
  /jackpot\s*:\s*['"]\€17,000,000['"]/,
  /winners\s*:\s*['"]0['"]/,
  /res\.json\s*\(\s*\{/,
  /app\.get\s*\(['"]\/*api\/draws/,
  /app\.get\s*\(['"]\/*api\/predictions/,
  /setDrawData\s*\(\s*\{/,
  /setPrediction\s*\(\s*\{/,
  /return\s*\{\s*id:/,
  /return\s*mockData/,
  /mockData/,
  /fakeData/,
  /dummyData/,
  /testData/
];

// Fonction pour rechercher des modèles dans un fichier
function searchPatterns(filePath, patterns) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    // Ignorer les répertoires node_modules et build
    if (filePath.includes('node_modules') || filePath.includes('build')) {
      return [];
    }
    
    // Ignorer certains types de fichiers
    if (!['.js', '.jsx', '.ts', '.tsx'].some(ext => filePath.endsWith(ext))) {
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    
    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        if (pattern.test(line)) {
          matches.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString()
          });
        }
      });
    });
    
    return matches;
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return [];
  }
}

// Fonction récursive pour scanner un répertoire
function scanDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    let results = [];
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Ignorer node_modules et .git
        if (file !== 'node_modules' && file !== '.git') {
          results = results.concat(scanDirectory(filePath));
        }
      } else {
        const matches = searchPatterns(filePath, fakeDataPatterns);
        if (matches.length > 0) {
          results.push({
            file: filePath,
            matches
          });
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error(`Erreur lors du scan du répertoire ${dirPath}:`, error);
    return [];
  }
}

// Point d'entrée principal
function findFakeData(rootDir) {
  console.log(`Recherche de données fictives dans: ${rootDir}`);
  const results = scanDirectory(rootDir);
  
  if (results.length === 0) {
    console.log('Aucune donnée fictive trouvée!');
    return;
  }
  
  console.log(`\n${results.length} fichiers avec des données potentiellement fictives:`);
  
  results.forEach(result => {
    console.log(`\nFichier: ${result.file}`);
    result.matches.forEach(match => {
      console.log(`  Ligne ${match.line}: ${match.content}`);
    });
  });
  
  // Créer un fichier de rapport
  const reportPath = path.join(rootDir, 'fake-data-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nRapport détaillé sauvegardé dans: ${reportPath}`);
}

// Exécuter le scan sur le répertoire racine du projet
findFakeData(path.join(__dirname, '..'));
