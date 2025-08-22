import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginInfo: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    this.loginInfo = this.fb.group({
      netId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  loginUser(): void {
    this.errorMessage = '';
    this.loginInfo.markAllAsTouched();
    
    if (this.loginInfo.invalid) {
        this.errorMessage = 'Veuillez remplir tous les champs requis';
        return;
    }
    const body = {
      NetID: this.loginInfo.value.netId,
      mdp: this.loginInfo.value.password
    };

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    this.http.post<{ success: boolean, message: string, user?: any }>('http://localhost:5114/LOGIN', body, httpOptions)
      .subscribe({
        next: (res) => {
          if (res.success) {
                const rawUser = Array.isArray(res.user) ? res.user[0] : res.user;

                const normalizedUser = {
                  NetID: rawUser.netID,
                  Name: rawUser.name,
                  Project: rawUser.project,
                  Matricule: rawUser.matricule,
                  Zone:rawUser.zone,
                  Supervisor:rawUser.supervisor
                };
                console.log('cc',rawUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));

                this.router.navigate(['/application/profile']);

          } else if(res.message=='Invalid credentials or inactive account.') {
          
            this.errorMessage =  'NetID ou mot de passe invalide.';
          }else{
             this.errorMessage='';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Erreur serveur, veuillez réessayer plus tard.';
        }
      });
  }
}
