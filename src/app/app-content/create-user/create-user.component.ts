import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UIService } from 'src/app/_utility-services/ui.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ApiService } from 'src/app/api.service';
import { UserProfile } from 'src/app/interfaces';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  form: FormGroup;
  NewOp: UserProfile;

  constructor(private uiService: UIService,private apiService: ApiService,public dialog: MatDialog,private fb: FormBuilder,) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      project: ['eps', Validators.required],
      svNumber: [''],
      opNumber: [''],
      stationName: [{ value: '', disabled: true }],
      leader: ['', Validators.required],
      currentLevel: ['', Validators.required],
      matricule: ['', Validators.required]
    });
    this.NewOp={
      Name:"",
      Project:"",
      TeamLeader:"",
      StationName:"",
      id:0,
      Matricule:0,
      completedLevels:[],
      currentLevel:0
    };
    

   }

  ngOnInit(): void {
    this.uiService.setCurrentPageName('create new operator');
  }

  onSubmit(): void {
    this.NewOp={
      id:0,
      Name:this.form.get('name')?.value,
      Project:this.form.get('project')?.value,
      TeamLeader:this.form.get('leader')?.value,
      StationName:this.form.get('stationName')?.value,
      Matricule:this.form.get('matricule')?.value,
      completedLevels:[],
      currentLevel:this.form.get('currentLevel')?.value

    };
    console.log("New Operator :",this.NewOp)
    this.openDialog();
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Do you want to create a new user?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser();
      }
    });
  }
  
  updateStationName() {
    const sv = this.form.get('svNumber')?.value?.toUpperCase() || '';
    const op = this.form.get('opNumber')?.value?.toUpperCase() || '';
    this.form.get('stationName')?.setValue(`SV${sv}-OP${op}`);
  }
  createUser(): void {

    this.apiService.addOperatorWithLevels(this.NewOp).subscribe({
      next: response => {
        console.log('Operator and levels added successfully:', response);
        this.dialog.open(NotificationDialogComponent, {
          data: { message: 'Operator and levels added successfully' }
        });
      },
      error: error => {
        console.error('Failed to add operator and levels:', error);
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: { message: 'Failed to add operator and levels: '+error }
        });
      }
    });
    
  }

}