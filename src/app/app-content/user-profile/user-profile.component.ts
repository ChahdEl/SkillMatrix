import { Component, OnDestroy, OnInit } from '@angular/core';
import { UIService } from 'src/app/_utility-services/ui.service';
import {UserProfile,Level} from 'src/app/interfaces'
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'
import { Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { levels } from 'src/app/fake-data/fake-levels';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  operator: UserProfile;
  lvl=0;
  Matricule:number;

  constructor(private uiService: UIService, private route: ActivatedRoute, 
    private router: Router, private location:Location, 
    private apiService: ApiService) {
this.Matricule = Number(this.route.snapshot.paramMap.get('Matricule'));
this.operator = {
id: 0,
Matricule: this.Matricule,
Name: '',
TeamLeader: '',
StationName: '',
Project: '',
currentLevel: 0,
completedLevels: levels.map(level => ({
ID: parseInt(level.id),
title: `Level ${level.id}`,
description: level.description,
score: 0, // Initial score 0
questionCount: level.questions.length,
answers: new Array(level.questions.length).fill(false)
}))
};
}


  ngOnInit(){
    this.uiService.setCurrentPageName('User profile');
    this.loadAllLevelsByOperator();
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
      
      this.operator.Name = operatorData.name;
      this.operator.TeamLeader = operatorData.teamLeader;
      this.operator.StationName = operatorData.currentStation;
      this.operator.Project = operatorData.project;
      this.operator.currentLevel = operatorData.currentLevel;
  
      console.log("Operator with fake levels:", this.operator);
    } catch (error) {
      console.error('Error loading operator data:', error);
    }
  }
  
  isLevelUnlocked(index: number): boolean {
    if (index === 0) return true;
  
    const prevLevel = this.operator.completedLevels[index - 1];
    return prevLevel.score >= 75;
  }
  getFakeScoreByLevel(index: number): number {
    return index === 0 ? 100 : 0; // Level 0 débloqué par défaut
  }
  
  
}




