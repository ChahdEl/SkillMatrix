
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UIService } from 'src/app/_utility-services/ui.service';
import { ApiService } from 'src/app/api.service';
import { LeaderProfile, UserProfile } from 'src/app/interfaces';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Chart, registerables } from 'chart.js';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-delete-member',
  templateUrl: './delete-member.component.html',
  styleUrls: ['./delete-member.component.css']
})
export class DeleteMemberComponent {
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
    
        
       
   }

  ngOnInit() {
    this.uiService.setCurrentPageName('Delete Operator');
    this.myform = this.formBuilder.group({
      name: ['', Validators.required],
      matricule:['', Validators.required],
    });
    this.loadTeamLeader();
  }

  async deleteOperator(matricule: number): Promise<void> {
    try {
      await firstValueFrom(this.apiService.deleteOperator(matricule));

      this.dialog.open(NotificationDialogComponent, {
        data: { message: 'The operator has been deleted successfully.' }
      });

    } catch (error) {
      console.error('Error deleting operator:', error);
      this.dialog.open(NotificationDialogComponent, {
        data: { message: 'Failed to delete the operator.' }
      });
    }
  }
 onSubmit(): void {
  if (!this.myform.valid) {
    this.myform.markAllAsTouched();
    this.dialog.open(NotificationDialogComponent, {
      data: { message: 'Please fill all required fields before deleting an operator.' }
    });
    return;
  }

  const selectedName = this.myform.get('name')?.value;
  const selectedMatricule = this.myform.get('matricule')?.value;

  const memberToDelete = this.leader.TeamMembers.find(member => 
    member.Name === selectedName && member.Matricule == selectedMatricule
  );

  if (!memberToDelete) {
    this.dialog.open(NotificationDialogComponent, {
      data: { message: 'No operator matches the selected name and matricule.' }
    });
    return;
  }

  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    data: { message: 'Do you want to delete this operator from your team members list?' }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.deleteOperator(memberToDelete.Matricule);
    }
  });
}



}
