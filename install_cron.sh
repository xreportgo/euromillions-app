#!/bin/bash

# Script d'installation des tâches CRON pour l'application EuroMillions

# Définir les variables
APP_DIR=$(pwd)
CRON_FILE="$APP_DIR/config/euromillions-cron.conf"
SCRIPT_PATH="$APP_DIR/scripts/cron/update_euromillions.sh"

# Vérifier que le script existe et est exécutable
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "Erreur: Le script $SCRIPT_PATH n'existe pas."
    exit 1
fi

if [ ! -x "$SCRIPT_PATH" ]; then
    echo "Rendre le script exécutable..."
    chmod +x "$SCRIPT_PATH"
fi

# Créer la configuration CRON
echo "# Tâches CRON pour l'application EuroMillions" > $CRON_FILE
echo "# Mise à jour les mardis et vendredis à 23h15" >> $CRON_FILE
echo "15 23 * * 2,5 $SCRIPT_PATH" >> $CRON_FILE

echo "Configuration CRON créée dans $CRON_FILE"

# Installer la tâche CRON
crontab $CRON_FILE

if [ $? -eq 0 ]; then
    echo "Tâche CRON installée avec succès !"
    echo "La mise à jour s'exécutera les mardis et vendredis à 23h15"
else
    echo "Erreur lors de l'installation de la tâche CRON"
    echo "Vous pouvez l'installer manuellement avec la commande:"
    echo "crontab $CRON_FILE"
fi

exit 0