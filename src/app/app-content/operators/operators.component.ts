import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ApiService } from 'src/app/api.service';
import { LeaderProfile } from 'src/app/interfaces';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})
export class OperatorsComponent implements OnInit {
  InputedStationID = "";
  InputedName = "";
  leader: LeaderProfile;
  showDisabledOperators = false;  
  stationSearch$ = new Subject<string>();  
  nameSearch$ = new Subject<string>();    

  NameFilter = '';
  stationFilter = '';
  levelFilter = '';
  scoreFilter = '';

  filteredTeamMembers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private uiService: UIService,
    private apiService: ApiService,
    private location: Location,
    private dialog: MatDialog
  ) {
    this.leader = {
      Matricule: 0,
      Name: '',
      Project: '',
      Zone: '',
      NetID: '',
      description: '',
      Supervisor: '',
      TeamMembers: []
    };
    
    this.stationSearch$.pipe(debounceTime(300)).subscribe(value => {
      this.InputedStationID = value.toUpperCase();
    });
    this.nameSearch$.pipe(debounceTime(300)).subscribe(value => {
      this.InputedName = value;
    });
  }

  ngOnInit(): void {
      this.uiService.setCurrentPageName('Operator');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user || !user.NetID) {
      console.error('Utilisateur non authentifié ou NetID manquant');
      return;
    }

    this.leader.Name = user.Name || 'Team Leader';
    this.leader.Project = user.Project || '';
    this.leader.Zone = user.Zone || '';
    this.leader.NetID = user.NetID;
    this.leader.Supervisor = user.Supervisor;
    this.leader.description = 'Vos informations personnelles ici...';

    this.loadAllLevelsByOperator();
  }

  goBackToPrevPage(): void {
    this.location.back();
  }

  async loadAllLevelsByOperator() {
    try {
      const teamMembers = this.showDisabledOperators
        ? await firstValueFrom(this.apiService.GET_Disabled_Operators_By_TLNZ(this.leader.NetID))
        : await firstValueFrom(this.apiService.GET_Operators_By_TLNZ(this.leader.NetID));

      this.leader.TeamMembers = teamMembers.map((item: any) => ({
        id: item.id,
        currentLevel: item.currentLevel,
        Matricule: item.matricule,
        Name: item.name,
        StationName: item.currentStation,
        Project: item.project,
        completedLevels: []
      }));

      for (const member of this.leader.TeamMembers) {
        const res = await firstValueFrom(this.apiService.GET_Levels_By_Operator(member.Matricule));
        member.completedLevels = res
          .map((item: any) => ({
            ID: item.lvlid,
            title: item.title,
            description: item.description,
            score: item.score
          }))
          .filter((lvl: any) => lvl.score > 0); 
      }

      this.filteredTeamMembers = [...this.leader.TeamMembers];

    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }

 applyFilters() {
  this.filteredTeamMembers = this.leader.TeamMembers.filter(member => {
    const matchesName = !this.NameFilter || member.Name.toUpperCase().includes(this.NameFilter.toUpperCase());
    const matchesStation = !this.stationFilter || member.StationName.toUpperCase().includes(this.stationFilter.toUpperCase());

    const matchesLevel = !this.levelFilter || member.currentLevel.toString().includes(this.levelFilter);

    const currentLevelScore = member.completedLevels.find(l => l.ID === member.currentLevel)?.score || 0;
    const matchesScore = !this.scoreFilter || currentLevelScore.toString().includes(this.scoreFilter);

    return matchesName && matchesStation && matchesLevel && matchesScore;
  });
}


  trackById(index: number, member: any) {
    return member.id;
  }
}
