<template>
  <div class="mes-grilles">
    <h1>Mes Grilles EuroMillions</h1>

    <!-- Formulaire d'ajout de grille -->
    <div class="grille-form card">
      <h2>Ajouter une nouvelle grille</h2>
      <div class="form-content">
        <div class="numbers-section">
          <h3>Numéros (5)</h3>
          <div class="number-buttons">
            <button
              v-for="n in 50"
              :key="`num-${n}`"
              :class="{ selected: selectedNumbers.includes(n) }"
              @click="toggleNumber(n)"
              :disabled="selectedNumbers.length >= 5 && !selectedNumbers.includes(n)"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <div class="stars-section">
          <h3>Étoiles (2)</h3>
          <div class="star-buttons">
            <button
              v-for="s in 12"
              :key="`star-${s}`"
              :class="{ selected: selectedStars.includes(s) }"
              @click="toggleStar(s)"
              :disabled="selectedStars.length >= 2 && !selectedStars.includes(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <div class="date-field">
            <label for="grille-date">Date du tirage:</label>
            <input type="date" id="grille-date" v-model="grilleDate" :min="today" />
          </div>
          <div class="nickname-field">
            <label for="grille-name">Nom de la grille:</label>
            <input type="text" id="grille-name" v-model="grilleName" placeholder="Ma grille chance" />
          </div>
          <button 
            class="save-button" 
            @click="saveGrille" 
            :disabled="!isFormValid"
          >
            Enregistrer cette grille
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des grilles enregistrées -->
    <div class="grilles-list">
      <h2>Mes grilles enregistrées</h2>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Chargement de vos grilles...</p>
      </div>
      
      <div v-else-if="userGrilles.length === 0" class="no-grilles">
        <p>Vous n'avez pas encore enregistré de grilles.</p>
        <p>Utilisez le formulaire ci-dessus pour ajouter votre première grille!</p>
      </div>
      
      <div v-else class="grilles-grid">
        <div 
          v-for="grille in userGrilles" 
          :key="grille.id" 
          class="grille-card"
          :class="{ 'tirage-passe': isTiragePasse(grille.date) }"
        >
          <div class="grille-header">
            <h3>{{ grille.name || 'Grille sans nom' }}</h3>
            <span class="grille-date">{{ formatDate(grille.date) }}</span>
          </div>
          
          <div class="grille-numbers">
            <div class="number-ball" v-for="num in grille.numbers" :key="`g-${grille.id}-n-${num}`">
              {{ num }}
            </div>
          </div>
          
          <div class="grille-stars">
            <div class="star-ball" v-for="star in grille.stars" :key="`g-${grille.id}-s-${star}`">
              {{ star }}
            </div>
          </div>

          <div class="grille-result" v-if="isTiragePasse(grille.date)">
            <template v-if="getGrilleResult(grille)">
              <div v-if="getGrilleResult(grille).matchedNumbers > 0 || getGrilleResult(grille).matchedStars > 0" class="result-info">
                <p>Résultat: <span class="matched">{{ getGrilleResult(grille).matchedNumbers }}</span> numéros et 
                <span class="matched">{{ getGrilleResult(grille).matchedStars }}</span> étoiles</p>
                <p v-if="getGrilleResult(grille).gain > 0" class="gain">
                  Gain: <span>{{ getGrilleResult(grille).gain.toFixed(2) }}€</span>
                </p>
              </div>
              <div v-else class="no-match">
                <p>Aucun numéro gagnant</p>
              </div>
            </template>
            <p v-else class="waiting-result">Résultats en attente...</p>
          </div>

          <div class="grille-actions">
            <button class="delete-button" @click="deleteGrille(grille.id)">
              <i class="fa fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { format, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default {
  name: 'MesGrilles',
  data() {
    return {
      selectedNumbers: [],
      selectedStars: [],
      grilleDate: '',
      grilleName: '',
      userGrilles: [],
      isLoading: true,
      tirages: [], // Pour vérifier les résultats
      today: format(new Date(), 'yyyy-MM-dd')
    };
  },
  computed: {
    isFormValid() {
      return this.selectedNumbers.length === 5 && 
             this.selectedStars.length === 2 && 
             this.grilleDate;
    }
  },
  methods: {
    toggleNumber(num) {
      if (this.selectedNumbers.includes(num)) {
        this.selectedNumbers = this.selectedNumbers.filter(n => n !== num);
      } else if (this.selectedNumbers.length < 5) {
        this.selectedNumbers.push(num);
      }
    },
    toggleStar(star) {
      if (this.selectedStars.includes(star)) {
        this.selectedStars = this.selectedStars.filter(s => s !== star);
      } else if (this.selectedStars.length < 2) {
        this.selectedStars.push(star);
      }
    },
    async saveGrille() {
      if (!this.isFormValid) return;

      try {
        // Créer l'objet grille
        const grille = {
          numbers: [...this.selectedNumbers].sort((a, b) => a - b),
          stars: [...this.selectedStars].sort((a, b) => a - b),
          date: this.grilleDate,
          name: this.grilleName.trim() || `Grille du ${format(parseISO(this.grilleDate), 'dd/MM/yyyy')}`
        };

        // Envoyer la grille au serveur
        const response = await axios.post('/api/grilles', grille);
        
        if (response.data.success) {
          // Ajouter la grille à la liste locale
          this.userGrilles.unshift(response.data.grille);
          
          // Réinitialiser le formulaire
          this.selectedNumbers = [];
          this.selectedStars = [];
          this.grilleName = '';
          this.grilleDate = '';
          
          // Notification de succès
          this.$notify({
            type: 'success',
            title: 'Grille enregistrée',
            text: 'Votre grille a été enregistrée avec succès!'
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la grille:', error);
        this.$notify({
          type: 'error',
          title: 'Erreur',
          text: 'Impossible d\'enregistrer la grille. Veuillez réessayer.'
        });
      }
    },
    async fetchGrilles() {
      this.isLoading = true;
      try {
        const response = await axios.get('/api/grilles');
        this.userGrilles = response.data.grilles;
        
        // Récupérer les tirages passés pour vérifier les résultats
        await this.fetchTirages();
      } catch (error) {
        console.error('Erreur lors de la récupération des grilles:', error);
        this.$notify({
          type: 'error',
          title: 'Erreur',
          text: 'Impossible de récupérer vos grilles. Veuillez réessayer.'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async fetchTirages() {
      try {
        const response = await axios.get('/api/tirages');
        this.tirages = response.data.tirages || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des tirages:', error);
      }
    },
    async deleteGrille(grilleId) {
      // Confirmation avant suppression
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette grille?')) return;
      
      try {
        const response = await axios.delete(`/api/grilles/${grilleId}`);
        
        if (response.data.success) {
          // Supprimer la grille de la liste locale
          this.userGrilles = this.userGrilles.filter(g => g.id !== grilleId);
          
          // Notification de succès
          this.$notify({
            type: 'success',
            title: 'Grille supprimée',
            text: 'La grille a été supprimée avec succès!'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la grille:', error);
        this.$notify({
          type: 'error',
          title: 'Erreur',
          text: 'Impossible de supprimer la grille. Veuillez réessayer.'
        });
      }
    },
    formatDate(dateString) {
      try {
        return format(parseISO(dateString), 'EEEE d MMMM yyyy', { locale: fr });
      } catch (e) {
        return dateString;
      }
    },
    isTiragePasse(dateString) {
      try {
        return isPast(parseISO(dateString));
      } catch (e) {
        return false;
      }
    },
    getGrilleResult(grille) {
      // Trouver le tirage correspondant à la date de la grille
      const tirage = this.tirages.find(t => {
        const tirageDate = new Date(t.date).toISOString().split('T')[0];
        return tirageDate === grille.date;
      });
      
      if (!tirage || !tirage.numbers || !tirage.stars) return null;
      
      // Compter les numéros et étoiles correspondants
      const matchedNumbers = grille.numbers.filter(num => 
        tirage.numbers.includes(num)
      ).length;
      
      const matchedStars = grille.stars.filter(star => 
        tirage.stars.includes(star)
      ).length;
      
      // Déterminer le gain (simplifié - à adapter selon les règles réelles)
      let gain = 0;
      
      if (matchedNumbers === 5 && matchedStars === 2) gain = 1000000; // Jackpot simplifié
      else if (matchedNumbers === 5 && matchedStars === 1) gain = 500000;
      else if (matchedNumbers === 5) gain = 100000;
      else if (matchedNumbers === 4 && matchedStars === 2) gain = 5000;
      else if (matchedNumbers === 4 && matchedStars === 1) gain = 200;
      else if (matchedNumbers === 4) gain = 100;
      else if (matchedNumbers === 3 && matchedStars === 2) gain = 50;
      else if (matchedNumbers === 3 && matchedStars === 1) gain = 15;
      else if (matchedNumbers === 3) gain = 10;
      else if (matchedNumbers === 2 && matchedStars === 2) gain = 15;
      else if (matchedNumbers === 2 && matchedStars === 1) gain = 8;
      else if (matchedNumbers === 2) gain = 4;
      else if (matchedNumbers === 1 && matchedStars === 2) gain = 8;
      
      return {
        matchedNumbers,
        matchedStars,
        gain
      };
    }
  },
  created() {
    // Initialiser la date avec la prochaine date de tirage
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Si aujourd'hui est avant vendredi, prendre le prochain vendredi
    // Sinon, prendre le prochain mardi
    const daysToAdd = dayOfWeek === 0 ? 2 : // Dimanche -> Mardi (+2)
                      dayOfWeek === 1 ? 1 : // Lundi -> Mardi (+1) 
                      dayOfWeek === 2 ? 3 : // Mardi -> Vendredi (+3)
                      dayOfWeek === 3 ? 2 : // Mercredi -> Vendredi (+2)
                      dayOfWeek === 4 ? 1 : // Jeudi -> Vendredi (+1)
                      dayOfWeek === 5 ? 4 : // Vendredi -> Mardi (+4)
                      3;  // Samedi -> Mardi (+3)
    
    const nextDrawDate = new Date();
    nextDrawDate.setDate(now.getDate() + daysToAdd);
    this.grilleDate = format(nextDrawDate, 'yyyy-MM-dd');
    
    // Charger les grilles de l'utilisateur
    this.fetchGrilles();
  }
};
</script>

<style scoped>
.mes-grilles {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #1976D2;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.numbers-section, .stars-section {
  margin-bottom: 15px;
}

h3 {
  margin-bottom: 10px;
  color: #555;
}

.number-buttons, .star-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.number-buttons button, .star-buttons button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #f9f9f9;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.number-buttons button:hover, .star-buttons button:hover {
  background: #e0e0e0;
}

.number-buttons button.selected {
  background: #1976D2;
  color: white;
  border-color: #1976D2;
}

.star-buttons button.selected {
  background: #FFC107;
  color: white;
  border-color: #FFC107;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.date-field, .nickname-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
  color: #555;
}

input[type="date"], input[type="text"] {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.save-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}

.save-button:hover {
  background: #3e8e41;
}

.save-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.grilles-list {
  margin-top: 40px;
}

.loading {
  text-align: center;
  padding: 30px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #1976D2;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-grilles {
  text-align: center;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.grilles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.grille-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s;
}

.grille-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.grille-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.grille-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.grille-date {
  color: #666;
  font-size: 14px;
}

.grille-numbers {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.number-ball {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #1976D2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.grille-stars {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.star-ball {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #FFC107;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.grille-result {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.result-info {
  font-size: 14px;
}

.matched {
  font-weight: bold;
  color: #4CAF50;
}

.gain {
  font-weight: bold;
  color: #FF5722;
}

.no-match {
  color: #999;
}

.waiting-result {
  color: #1976D2;
  font-style: italic;
}

.grille-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-button {
  background: none;
  border: none;
  color: #F44336;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.delete-button:hover {
  background: rgba(244, 67, 54, 0.1);
}

.tirage-passe {
  position: relative;
}

.tirage-passe::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: #F44336;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

@media (max-width: 768px) {
  .grilles-grid {
    grid-template-columns: 1fr;
  }
  
  .form-content {
    gap: 15px;
  }
  
  .number-buttons button, .star-buttons button {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
}
</style>
