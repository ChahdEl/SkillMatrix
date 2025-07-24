import { Component, OnInit } from '@angular/core';
import { UIService } from 'src/app/_utility-services/ui.service';
import { UserProfile, Level } from 'src/app/interfaces';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { MatDialog } from '@angular/material/dialog'; // Ajoutez cette importation
import { CodeVerificationDialogComponent } from '../code-verification-dialog/code-verification-dialog.component'; // Ajoutez cette importation

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  operator: UserProfile;
  lvl = 0;
  Matricule: number;
  isLevel4Unlocked: boolean = false;
  level3Score: number = 0;

  constructor(
    private uiService: UIService,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public dialog: MatDialog 
  ) {
    this.Matricule = Number(this.route.snapshot.paramMap.get('Matricule'));
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

  ngOnInit(){
    this.uiService.setCurrentPageName('User profile');
    this.loadAllLevelsByOperator();
  }
  
  redirectWithParam(lvl: string) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['../application/level-details'], {
       queryParams: { 
         level : lvl,
         mat: this.operator.Matricule,
         st: this.operator.StationName
       } 
    }));
    window.open(url, '_blank');
  }

async loadAllLevelsByOperator() {
  try {
    // Charger les données opérateur
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

    // Charger les niveaux complétés
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

    // Stocker le score du niveau 3
    const level3 = this.operator.completedLevels.find(lvl => lvl.ID === 3);
    this.level3Score = level3 ? level3.score : 0;

    // On ne déverrouille pas Level 4 ici
    // La vérification se fera dans onLevelClick()

    console.log("Operator :", this.operator);
    console.log("Level 3 Score :", this.level3Score);

  } catch (error) {
    console.error('Error loading operator data:', error);
  }
}


async onLevelClick(levelID: number): Promise<void> {
 
  if (levelID === 4) {
  
    if (this.level3Score < 85) {
      alert("You must score at least 85% on Level 3 to access Level 4.");
      return;
    }
    const isCodeValid = await this.verifyCodeAndUnlockLevel4();
    if (!isCodeValid) {
      alert("Incorrect code. Access denied.");
      return;
    }
  }

  // Accès au test
  this.router.navigate(['/application/level-details', {
    level: levelID,
    mat: this.operator.Matricule,
    st: this.operator.StationName
  }]);
}

private async verifyCodeAndUnlockLevel4(): Promise<boolean> {
  const dialogRef = this.dialog.open(CodeVerificationDialogComponent);
  
  return await firstValueFrom(dialogRef.afterClosed()).then(result => {
    return result === true;
  });
}
}