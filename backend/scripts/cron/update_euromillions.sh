#!/bin/bash

# Script d'installation des tâches CRON pour l'application EuroMillions

# Définir les variables
APP_DIR="$(dirname "$(readlink -f "$0")")"
CRON_FILE="$APP_DIR/config/euromillions-cron.conf"
SCRIPT_PATH="$APP_DIR/backend/scripts/update_euromillions.js"

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
echo "15 23 * * 2,5 cd $APP_DIR && node $SCRIPT_PATH >> $APP_DIR/logs/update_euromillions.log 2>&1" >> $CRON_FILE

# Installer la tâche CRON
if [ $? -eq 0 ]; then
  echo "Tâche CRON installée avec succès !"
  echo "La mise à jour s'exécutera les mardis et vendredis à 23h15"
  
  # Vérifier si crontab existe déjà
  crontab -l > /tmp/current_cron 2>/dev/null
  if [ $? -eq 0 ]; then
    # Ajouter notre tâche si elle n'existe pas déjà
    if ! grep -q "$SCRIPT_PATH" /tmp/current_cron; then
      cat $CRON_FILE >> /tmp/current_cron
      crontab /tmp/current_cron
      echo "La tâche a été ajoutée au crontab existant."
    else
      echo "La tâche existe déjà dans le crontab."
    fi
  else
    # Créer un nouveau crontab avec notre tâche
    crontab $CRON_FILE
    echo "Un nouveau crontab a été créé avec notre tâche."
  fi
  
  rm -f /tmp/current_cron
  
  exit 0
else
  echo "Erreur lors de l'installation de la tâche CRON"
  exit 1
fi
