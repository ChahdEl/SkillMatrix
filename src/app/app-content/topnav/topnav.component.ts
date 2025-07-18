import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UIService } from '../../_utility-services/ui.service';
import { FormGroup, FormControl, Validators , FormArray, FormBuilder} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss']
})
export class TopnavComponent implements OnInit {
  componentName = '';
  prevComponentName = '';
  searchForm: FormGroup = new FormGroup({
    matricule: new FormControl('', Validators.required)
  });
  searchError='';
  

  constructor(private uiService: UIService, private router: Router,private formBuilder: FormBuilder,private location:Location) {}

  ngOnInit() {
    this.getComponentName();
    this.searchForm = this.formBuilder.group({
      matricule: ['', [Validators.required]]
    });
  }

  async getComponentName() {
    this.uiService.currentPageNameChanged.subscribe((x: string) => {this.componentName = x; 
      console.log(x);
    });
  }

  changeSidenavState(){
    this.uiService.changeToolbarState();
  }
  logOut(){
    this.router.navigate(['login'])
  }
  back(): void {
    this.location.back();
  }
  searchUser(): void {
    if (this.searchForm.valid) {
      //const matricule = this.searchForm.get('matricule').value;
      // Call API to search for user by matricule
      // If user found, redirect to user profile page
      // If not, display error message with option to create new user
    }
  }
}
