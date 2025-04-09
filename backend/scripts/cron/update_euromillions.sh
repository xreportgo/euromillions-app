#!/bin/bash

# Script pour mettre à jour les données EuroMillions
# À exécuter les mardis et vendredis après les tirages

# Définir les variables
APP_DIR="/chemin/vers/euromillions-app"
LOG_DIR="$APP_DIR/scripts/logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/update_$TIMESTAMP.log"

# Créer le répertoire de logs s'il n'existe pas
mkdir -p $LOG_DIR

# Fonction de journalisation
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a $LOG_FILE
}

# Démarrer la journalisation
log "Début de la mise à jour des données EuroMillions"

# Aller dans le répertoire de l'application
cd $APP_DIR
log "Répertoire de travail: $(pwd)"

# Exécuter le script de mise à jour
cd backend
log "Exécution du script de mise à jour..."
node scripts/updateDraws.js >> $LOG_FILE 2>&1

# Vérifier le résultat
if [ $? -eq 0 ]; then
    log "Mise à jour terminée avec succès"
else
    log "ERREUR: La mise à jour a échoué"
fi

log "Fin du script de mise à jour"

exit 0