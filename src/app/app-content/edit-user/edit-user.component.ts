import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/api.service';
import { UserProfile } from 'src/app/interfaces';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { UIService } from 'src/app/_utility-services/ui.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  form: FormGroup;
  operator: UserProfile;
  userMatricule: number;
  initialStation: string | undefined;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private uiService: UIService
  ) {
    this.userMatricule = parseInt(this.route.snapshot.paramMap.get('Matricule') || '0', 10);
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

    this.operator={
      Name:"test",
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
    this.uiService.setCurrentPageName('Edit user');
    this.loadAllLevelsByOperator();
  }



  async loadAllLevelsByOperator() {

    try {
      const res = await firstValueFrom(this.apiService.GET_Operator_By_ID(this.userMatricule));
      const operatorData = Array.isArray(res) ? res[0] : res; 
      // Assuming res is a single object, not an array
      this.operator = {
        id: operatorData.id,
        Matricule: operatorData.matricule,
        TeamLeader: operatorData.teamLeader,
        Name: operatorData.name,
        StationName: operatorData.currentStation,
        Project: operatorData.project,
        completedLevels: [],  // Initialize empty levels array
        currentLevel: operatorData.currentLevel,      // Default value for currentLevel
      };
      this.initialStation = operatorData.currentStation;

      this.form.patchValue({
        name: this.operator.Name,
        project: this.operator.Project,
        stationName: this.operator.StationName,
        leader: this.operator.TeamLeader,
        currentLevel: this.operator.currentLevel,
        matricule: this.operator.Matricule
      });


      const res2 = await firstValueFrom(this.apiService.GET_Levels_By_Operator(this.userMatricule));
      this.operator.completedLevels = res2.map((item: any) => {
        // Extracting answers and mapping them to a boolean array
        const answers: boolean[] = [];
        for (let i = 1; i <= 20; i++) {
          answers.push(!!item[`anS${i}`]);  // Convert to boolean using double negation
        }
        console.log(" ----- answers inserted:",answers);
        return {
          ID: item.lvlid,
          title: item.title,
          description: item.description,
          score: item.score,
          questionCount:item.questionCount,
          answers: answers  // Add the answers array
        };
      });
  
      console.log("Operator : ", this.operator,res); // Check levels loaded
  
    } catch (error) {
      console.error('Error loading operator data:', error);
    }
  }









  // Method to update station name based on SV and OP inputs
  updateStationName() {
    const sv = this.form.get('svNumber')?.value?.toUpperCase() || '';
    const op = this.form.get('opNumber')?.value?.toUpperCase() || '';
    this.form.get('stationName')?.setValue(`SV${sv}-OP${op}`);
  }

  // Step 4: On form submission, update the operator and check station levels
  onSubmit(): void {
    if (this.form.valid && this.operator) {
      // Update the UserProfile with form values
      const updatedUser: UserProfile = {
        ...this.operator,
        Name: this.form.get('name')?.value,
        Project: this.form.get('project')?.value,
        TeamLeader: this.form.get('leader')?.value,
        StationName: this.form.get('stationName')?.value,
        Matricule: this.form.get('matricule')?.value,
        currentLevel: this.form.get('currentLevel')?.value
      };

      // Call updateOperator to update the operator details
      this.apiService.updateOperator(updatedUser).subscribe({
        next: () => {
          // After successful update, check if station levels exist
          this.checkAndHandleStationLevels(updatedUser);
        },
        error: (error) => {
          console.error('Error updating operator:', error);
          this.dialog.open(NotificationDialogComponent, {
            data: { message: 'Failed to update operator: ' + error.message }
          });
        }
      });
    }
  }


  // Method to check for existing station levels and create if needed
  private checkAndHandleStationLevels(updatedUser: UserProfile) {
    const newStationName = updatedUser.StationName;
    
    if (newStationName && newStationName !== this.initialStation) {
      this.apiService.checkLevelsByOperatorAndStation(updatedUser.Matricule, newStationName).subscribe({
        next: (exists) => {
          if (exists) {
            // If levels exist, notify that the operator has returned to an old station
            this.dialog.open(NotificationDialogComponent, {
              data: { message: 'Operator has returned to a station they previously worked on.' }
            });
          } else {
            // If no levels exist, add new levels for the new station
            this.apiService.addNewOperatorLevels(updatedUser.Matricule, updatedUser.TeamLeader, newStationName).subscribe({
              next: () => {
                this.dialog.open(NotificationDialogComponent, {
                  data: { message: 'Operator modified, and station levels created.' }
                });
              },
              error: (err) => {
                console.error('Error adding new operator levels:', err);
                this.dialog.open(NotificationDialogComponent, {
                  data: { message: 'Failed to create new levels for the station.' }
                });
              }
            });
          }
        },
        error: (err) => {
          console.error('Error checking levels:', err);
        }
      });
    } else {
      // If the station hasn’t changed, simply show a success dialog
      this.dialog.open(NotificationDialogComponent, {
        data: { message: 'Operator updated successfully.' }
      });
    }
  }
}
