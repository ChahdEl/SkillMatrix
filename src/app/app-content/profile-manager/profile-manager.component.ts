import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ApiService } from 'src/app/api.service';
import { LeaderProfile } from 'src/app/interfaces';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-profile-manager',
  templateUrl: './profile-manager.component.html',
  styleUrls: ['./profile-manager.component.scss']
})
export class ProfileManagerComponent implements OnInit {
  myform!: FormGroup;
  leader!:LeaderProfile;
  


  constructor(private uiService: UIService,private formBuilder: FormBuilder, private apiService:ApiService,private dialog: MatDialog) {
    this.leader={
      Matricule:0,
          Name: '',
      Project: '',
      NetID: '',
      Zone:'',
      description: '',
      Supervisor:'',
      TeamMembers: []
    }
   }
   async loadTeamLeader(){
    const user=JSON.parse(localStorage.getItem('user') || '{}');
    this.leader.Matricule=user.Matricule;
    this.leader.NetID = user.NetID;
    this.leader.Name = user.Name || 'Team Leader';
    this.leader.Project = user.Project || '';
    this.leader.Zone = user.Zone || '';
    this.leader.description = 'Description AND note for teamLeader'; 
    this.leader.Supervisor=user.Supervisor
    const teamMembers = await firstValueFrom(this.apiService.GET_Operators_By_TLNZ(this.leader.NetID));
    
        this.leader.TeamMembers = teamMembers.map((item: any) => ({
          id: item.id,
          currentLevel: item.currentLevel,
          Matricule: item.matricule,
          Name: item.name,
          StationName: item.currentStation,
          Project: item.project,
          completedLevels: [],
          TeamLeader: item.teamLeader
        }));
    
        for (const member of this.leader.TeamMembers) {
          const res = await firstValueFrom(this.apiService.GET_Levels_By_Operator(member.Matricule));
          member.completedLevels = res.map((item: any) => ({
            ID: item.lvlid,
            title: item.title,
            description: item.description,
            score: item.score,
            questionCount: item.questionCount,
            answers: []
          }));
        }
        this.myform.patchValue({
            name: this.leader.Name,
            project: this.leader.Project,
            zone: this.leader.Zone,
            supervisor:this.leader.Supervisor
        });
   }

  ngOnInit() {
    this.uiService.setCurrentPageName('profile manager');
    this.myform = this.formBuilder.group({
      name: ['', Validators.required],
      project:['', Validators.required],
      zone:['', Validators.required],
      supervisor:['', Validators.required]
    });
    this.loadTeamLeader();
  }


  addStation(): void {
    const stationFG = this.formBuilder.group({
      stationid: ['', Validators.required],
      level: ['', Validators.required]
    });
    if (this.myform?.get('stations')) {
      (this.myform.get('stations') as FormArray).push(stationFG);
    }
  }

  removeStation(index: number): void {
    if (this.myform?.get('stations')) {
      (this.myform.get('stations') as FormArray).removeAt(index);
    }
  }

  get stations(): FormArray {
    return this.myform?.get('stations') as FormArray;
  }

  onSubmit(): void {
    if (this.myform.valid && this.leader) {
          const updatedLeader: LeaderProfile = {
            ...this.leader,
            Name: this.myform.get('name')?.value,
            Project: this.myform.get('project')?.value,
            Zone:this.myform.get('zone')?.value,
            Supervisor:this.myform.get('supervisor')?.value,
            Matricule: this.leader.Matricule

          };
          console.log('Data to be sent:', updatedLeader);
          this.apiService.updateLeader(updatedLeader).subscribe({
            next: () => {
              localStorage.setItem('user',JSON.stringify(updatedLeader))
                  this.dialog.open(NotificationDialogComponent, {
                    data: { message: 'Profil mis à jour avec succès !' }
                  });
                },
           error: (error: { message: string; }) => {
              console.error('Error updating leader:', error);
              this.dialog.open(NotificationDialogComponent, {
                data: { message: 'Failed to update leader: ' + error.message }
              });
            }
          });
        }
  }
}