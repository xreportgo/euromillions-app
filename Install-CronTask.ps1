# Script PowerShell pour configurer la tâche planifiée pour l'application EuroMillions

# Définir les variables
$AppDir = $PSScriptRoot
$ScriptPath = Join-Path -Path $AppDir -ChildPath "backend\scripts\update_euromillions.js"
$LogPath = Join-Path -Path $AppDir -ChildPath "logs\update_euromillions.log"

# Créer le répertoire des logs s'il n'existe pas
$LogDir = Split-Path -Path $LogPath
if (-not (Test-Path -Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory -Force
    Write-Host "Répertoire de logs créé: $LogDir"
}

# Vérifier que Node.js est installé
try {
    $nodeVersion = node -v
    Write-Host "Node.js trouvé: $nodeVersion"
}
catch {
    Write-Error "Node.js n'est pas installé. Impossible de continuer."
    exit 1
}

# Créer la tâche planifiée
$TaskName = "EuroMillions_Update"
$TaskDescription = "Mise à jour des résultats EuroMillions tous les mardis et vendredis à 23h15"

# Suppression de la tâche si elle existe déjà
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Tâche existante supprimée"
}

# Créer une action pour exécuter le script Node.js
$action = New-ScheduledTaskAction -Execute "node" -Argument "`"$ScriptPath`" > `"$LogPath`" 2>&1"

# Définir le déclencheur (mardis et vendredis à 23h15)
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Tuesday,Friday -At "23:15"

# Créer les paramètres de la tâche
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Créer et enregistrer la tâche
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest
Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $action -Trigger $trigger -Settings $settings -Principal $principal

# Vérifier si la tâche a été créée avec succès
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "Tâche CRON installée avec succès !"
    Write-Host "La mise à jour s'exécutera les mardis et vendredis à 23h15"
} else {
    Write-Error "Erreur lors de l'installation de la tâche CRON"
    exit 1
}

Write-Host "Configuration de la tâche CRON terminée"
