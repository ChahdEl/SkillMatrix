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
  selector: 'app-leader-profile',
  templateUrl: './leader-profile.component.html',
  styleUrls: ['./leader-profile.component.css']
})
export class LeaderProfileComponent implements OnInit, OnChanges {
  InputedStationID = "";
  InputedName = "";
  leader: LeaderProfile;
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

    this.stationSearch$.pipe(debounceTime(300)).subscribe(value => {
      this.InputedStationID = value.toUpperCase();
    });
    this.nameSearch$.pipe(debounceTime(300)).subscribe(value => {
      this.InputedName = value;
    });
  }

 ngOnInit() {
  this.uiService.setCurrentPageName('Leader Profile');

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

  toggleDisabledOperators() {
    this.showDisabledOperators = !this.showDisabledOperators;
    const message = this.showDisabledOperators
      ? 'Displaying disabled operators.'
      : 'Displaying active operators.';

    this.dialog.open(NotificationDialogComponent, {
      data: { message }
    });

    this.loadAllLevelsByOperator();
  }

  openDeleteConfirmationDialog(matricule: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Do you want to delete this operator from your team members list?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteOperator(matricule);
      }
    });
  }
 

  async deleteOperator(matricule: number): Promise<void> {
    try {
      await firstValueFrom(this.apiService.deleteOperatorByMatricule(matricule));

      this.dialog.open(NotificationDialogComponent, {
        data: { message: 'The operator has been deleted successfully.' }
      });

      this.loadAllLevelsByOperator();
    } catch (error) {
      console.error('Error deleting operator:', error);
      this.dialog.open(NotificationDialogComponent, {
        data: { message: 'Failed to delete the operator.' }
      });
    }
  }
}
