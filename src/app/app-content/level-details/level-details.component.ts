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
import { CodeVerificationDialogComponent } from '../code-verification-dialog/code-verification-dialog.component';

@Component({
  selector: 'app-level-details',
  templateUrl: './level-details.component.html',
  styleUrls: ['./level-details.component.css']
})
export class LevelDetailsComponent implements OnInit {
  operator: UserProfile;
  Matricule: number;
  lvl: number;
  selectedLvl: Level;
  isDataLoaded = false;  // New flag to control data loading

  constructor(
    private uiService: UIService,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ) { 
    this.Matricule = Number(this.route.snapshot.paramMap.get('mat'));
    this.lvl = Number(this.route.snapshot.paramMap.get('level'));
    this.selectedLvl = levels[this.lvl];
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
    this.loadAllLevelsByOperator();
    this.uiService.setCurrentPageName('Level details');
  }

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
        completedLevels: [],
        currentLevel: operatorData.currentLevel,
      };

      // Load levels and answers for the operator
      const res2 = await firstValueFrom(this.apiService.GET_Levels_By_Operator(this.Matricule));
      this.operator.completedLevels = res2.map((item: any) => {
        const answers: boolean[] = [];
        for (let i = 1; i <= 20; i++) {
          answers.push(!!item[`anS${i}`]);
        }
        return {
          ID: item.lvlid,
          title: item.title,
          description: item.description,
          score: item.score,
          questionCount: item.questionCount,
          answers: answers
        };
      });

      console.log("Operator data and levels loaded:", this.operator);

      // Set data loaded flag to true
      this.isDataLoaded = true;
      
      // Manually trigger change detection if needed
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error loading operator data:', error);
    }
  }

  updateScore(index: number, event: any): void {
    this.operator.completedLevels[this.lvl].answers[index] = event.target.checked;
    const totalChecked = this.operator.completedLevels[this.lvl].answers.filter(answer => answer).length;
    this.operator.completedLevels[this.lvl].score = Math.ceil((totalChecked / this.selectedLvl.questions.length) * 100);
    console.log('Updated answers for this level:', this.operator.completedLevels[this.lvl].answers);
  }

 // Ajoutez cette méthode à la classe LevelDetailsComponent
// Ajoutez cette méthode
private async verifyCodeAndUnlockLevel4(): Promise<boolean> {
  const dialogRef = this.dialog.open(CodeVerificationDialogComponent);
  
  return await firstValueFrom(dialogRef.afterClosed()).then(result => {
    return result === true;
  });
}

// Modifiez saveLevelChanges
async saveLevelChanges(): Promise<void> {
  const levelData = this.operator.completedLevels[this.lvl];
  const score = levelData.score;
  const answers = levelData.answers;

  await firstValueFrom(this.apiService.updateLevelScoreAndAnswers(
    this.Matricule, this.lvl, score, this.operator.StationName, answers));

  if (score > 85 && this.operator.currentLevel == this.lvl) {
    let canUnlockNextLevel = true;
    
    // Vérification spéciale pour le niveau 3
    if (this.lvl === 3) {
      canUnlockNextLevel = await this.verifyCodeAndUnlockLevel4();
    }

    if (canUnlockNextLevel) {
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
          ` }
      });
    }
  } else {
    this.dialog.open(NotificationDialogComponent, {
      data: { message: `Level score updated to ${score}%` }
    });
  }
}
  goBackToPrevPage(): void {
    this.location.back();
  }
}