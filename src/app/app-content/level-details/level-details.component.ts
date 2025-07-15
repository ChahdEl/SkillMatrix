import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { Level, UserProfile } from 'src/app/interfaces';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/api.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { firstValueFrom } from 'rxjs';
import { levels } from 'src/app/fake-data/fake-levels';

@Component({
  selector: 'app-level-details',
  templateUrl: './level-details.component.html',
  styleUrls: ['./level-details.component.css']
})
export class LevelDetailsComponent implements OnInit {
  operator: UserProfile;
  Matricule!: number;
  lvl!: number;
  selectedLvl!: Level;
  isDataLoaded = false;  

  constructor(
    private uiService: UIService,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ) { 
   
    this.operator = {
      Name: "test",
      Project: "",
      TeamLeader: "",
      StationName: "",
      id: 0,
      Matricule: 0,
      completedLevels: [],
      currentLevel: 0
    };
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.lvl = Number(params['level']);
      this.Matricule = Number(params['mat']);
      const station = params['st'];
  
      if (this.lvl >= 0 && this.lvl < levels.length) {
        this.selectedLvl = levels[this.lvl];
      }
  
      this.loadAllLevelsByOperator();
    });
  
    this.uiService.setCurrentPageName('Level details');
  }
  
  


 // Modifiez loadAllLevelsByOperator
 async loadAllLevelsByOperator() {
  try {
    const res = await firstValueFrom(this.apiService.GET_Operator_By_ID(this.Matricule));
    const operatorData = Array.isArray(res) ? res[0] : res;
    
    this.operator = {
      id: operatorData.id,
      Matricule: operatorData.matricule,
      TeamLeader: operatorData.teamLeader,
      Name: operatorData.name,
      StationName: operatorData.currentStation,
      Project: operatorData.project,
      completedLevels: [], // Initialiser vide d'abord
      currentLevel: operatorData.currentLevel,
    };

    // Chargez les niveaux depuis l'API
    const res2 = await firstValueFrom(this.apiService.GET_Levels_By_Operator(this.Matricule));

    // Mappez les niveaux avec les données de fake-levels
    this.operator.completedLevels = levels.map((level) => {
      const levelFromApi = res2.find((item: any) => item.lvlid === parseInt(level.id));
      
      // Créez le tableau answers en fonction des questions du niveau
      const answers = level.questions.map((_, i) => {
        return levelFromApi ? !!levelFromApi[`anS${i + 1}`] : false;
      });

      return {
        ID: parseInt(level.id),
        title: `Level ${level.id}`,
        description: level.description,
        score: levelFromApi?.score || 0,
        questionCount: level.questions.length,
        answers: answers
      };
    });

    console.log("Operator data loaded:", this.operator);
    this.isDataLoaded = true;
    this.cdr.detectChanges();

  } catch (error) {
    console.error('Error loading operator data:', error);
    // Fallback avec fake data
    this.operator.completedLevels = levels.map(level => ({
      ID: parseInt(level.id),
      title: `Level ${level.id}`,
      description: level.description,
      score: 0,
      questionCount: level.questions.length,
      answers: new Array(level.questions.length).fill(false)
    }));
    this.isDataLoaded = true;
    this.cdr.detectChanges();
  }
}

updateScore(index: number, event: any): void {
  if (!this.operator.completedLevels[this.lvl]) {
    return;
  }

  // Mise à jour de la réponse
  this.operator.completedLevels[this.lvl].answers[index] = event.target.checked;

  // Calcul du score
  const totalChecked = this.operator.completedLevels[this.lvl].answers
    .slice(0, this.selectedLvl.questions.length) // Prendre seulement le nombre de questions existantes
    .filter(answer => answer).length;

  this.operator.completedLevels[this.lvl].score = Math.ceil(
    (totalChecked / this.selectedLvl.questions.length) * 100
  );
}
  async saveLevelChanges(): Promise<void> {
    try {
      // Vérification de sécurité
      if (!this.operator.completedLevels[this.lvl]) {
        console.error('No level data available for level', this.lvl);
        return;
      }
      const levelData = this.operator.completedLevels[this.lvl];
      const score = levelData.score;
      const answers = levelData.answers;
      // Créez l'objet à sauvegarder dans le format attendu par l'API
      const saveData: any = {
        lvlid: this.lvl,
        score: score,
        questionCount: this.selectedLvl.questions.length
      };
      // Map des réponses vers anS1, anS2, etc.
      answers.forEach((answer, index) => {
        saveData[`anS${index + 1}`] = answer ? 1 : 0;
      });
      // Enregistrement
      await firstValueFrom(
        this.apiService.updateLevelScoreAndAnswers(
          this.Matricule, 
          this.lvl, 
          score, 
          this.operator.StationName, 
          saveData // Envoyez l'objet formaté
        )
      );
      // Gestion du déblocage du niveau suivant
      if (score > 85 && this.operator.currentLevel === this.lvl) {
        const newLevel = this.operator.currentLevel + 1;
        await firstValueFrom(this.apiService.updateOperatorLevel(this.Matricule, newLevel));
        this.operator.currentLevel = newLevel;
        
        this.dialog.open(NotificationDialogComponent, {
          data: { message: `
            <div style="text-shadow: 10px;text-align: center;font-size: larger;font-weight: 600;">
              Congratulations! You've unlocked level ${newLevel}
            </div>
            <div class="gif" style="margin-left: 80px;">
              <img src="assets/LevelUp.gif" alt="Level Up" style="width: 250px; height: 250px;margin-left: 20%;">
            </div>
          `}
        });
      } else {
        this.dialog.open(NotificationDialogComponent, {
          data: { message: `Level score updated to ${score}%` }
        });
      }
    } catch (error) {
      console.error('Error saving level changes:', error);
      this.dialog.open(NotificationDialogComponent, {
        data: { message: 'Failed to save changes. Please try again.' }
      });
    }
  } 
}