import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ApiService } from 'src/app/api.service';
import { MatDialog } from '@angular/material/dialog';
import { LeaderProfile, UserProfile } from 'src/app/interfaces';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';


@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnChanges, OnInit{
   InputedStationID = "";
    InputedName = "";
    leader: LeaderProfile;
    leader2: LeaderProfile;
    showDisabledOperators = false;  
    stationSearch$ = new Subject<string>();  
    nameSearch$ = new Subject<string>();     
  
    constructor(
      private uiService: UIService,
      private apiService: ApiService,
      private dialog: MatDialog
    ) {
     this.leader = {
        Matricule:0,
        Name: '',
        Project: '',
        Zone:'',
        NetID: '',
        description: '',
        Supervisor:'',
        TeamMembers: []
      };
       this.leader2 = {
        Matricule:0,
        Name: '',
        Project: '',
        Zone:'',
        NetID: '',
        description: '',
        Supervisor:'',
        TeamMembers: []
      };
  
      this.stationSearch$.pipe(debounceTime(300)).subscribe(value => {
        this.InputedStationID = value.toUpperCase();
      });
      this.nameSearch$.pipe(debounceTime(300)).subscribe(value => {
        this.InputedName = value;
      });
    }
  
   ngOnInit() {
    this.uiService.setCurrentPageName('Archive');
  
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  
    if (!user || !user.NetID) {
      console.error('Utilisateur non authentifié ou NetID manquant');
      return;
    }
  
    this.leader.Name = user.Name || 'Team Leader';
    this.leader.Project = user.Project || '';
    this.leader.Zone = user.Zone || '';
    this.leader.NetID = user.NetID;
    this.leader.Supervisor=user.Supervisor;
    this.leader.description = 'Vos informations personnelles ici...';

    
  
    this.loadAllLevelsByOperator();  
  }
  
  
    ngOnChanges(changes: SimpleChanges): void {
      console.log(this.InputedStationID, this.InputedName);
    }
  
    updateStationSearch(value: string) {
      this.stationSearch$.next(value);
    }
  
    updateNameSearch(value: string) {
      this.nameSearch$.next(value);
    }
  
    onStationInputChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      this.updateStationSearch(input.value.toUpperCase());
    }
 
    onNameInputChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      this.updateNameSearch(input.value);
    }
    async loadAllLevelsByOperator() {
      try {
        const res2 = await firstValueFrom(this.apiService.GET_Operators_By_TLNZ(this.leader.NetID));
 this.leader2.TeamMembers = res2.map((item: any) => ({
          id: item.id,
          currentLevel: item.currentLevel,
          Matricule: item.matricule,
          Name: item.name,
          StationName: item.currentStation,
          Project: item.project,
          completedLevels: []
        }));
  
        
       const res=await firstValueFrom(this.apiService.GET_Quit_Operators_By_TLNZ(this.leader.NetID))
          
        this.leader.TeamMembers = res.map((item: any) => ({
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
          member.completedLevels = res.map((item: any) => ({
            ID: item.lvlid,
            title: item.title,
            description: item.description,
            score: item.score
          }));
        }
  
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    }
  

}
