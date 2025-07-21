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
    private location: Location,
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
    console.log("test : ",this.operator.Name);
  }
  goBackToPrevPage(): void {
    this.location.back();
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

    const level3 = this.operator.completedLevels.find(lvl => lvl.ID === 3);
    this.level3Score = level3 ? level3.score : 0;

    if (this.level3Score >= 85 && this.operator.currentLevel === 3) {
      const isCodeValid = await this.verifyCodeAndUnlockLevel4();
      this.isLevel4Unlocked = isCodeValid;
      
      if (isCodeValid) {
        const newLevel = 4;
        await firstValueFrom(this.apiService.updateOperatorLevel(this.Matricule, newLevel));
        this.operator.currentLevel = newLevel;
      }
    } else {
      this.isLevel4Unlocked = this.operator.currentLevel >= 4;
    }

    console.log("Operator :", this.operator);

  } catch (error) {
    console.error('Error loading operator data:', error);
  }
}

private async verifyCodeAndUnlockLevel4(): Promise<boolean> {
  const dialogRef = this.dialog.open(CodeVerificationDialogComponent);
  
  return await firstValueFrom(dialogRef.afterClosed()).then(result => {
    return result === true;
  });
}
}