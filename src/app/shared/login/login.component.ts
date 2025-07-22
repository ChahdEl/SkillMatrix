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

  ngOnInit(): void {}

  loginUser(): void {
    if (this.loginInfo.invalid) return;

    // Construire le corps de la requête tel que le backend l'attend
        const body = {
          NetID: this.loginInfo.value.netId,
          mdp: this.loginInfo.value.password
        };

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    // POST vers http://localhost:5114/LOGIN avec body JSON
    this.http.post<{success: boolean, message: string, user?: any}>('http://localhost:5114/LOGIN', body, httpOptions)
      .subscribe({
        next: (res) => {
          if (res.success) {
            localStorage.setItem('user', JSON.stringify(res.user));

            this.router.navigate(['/application/profile']);
          } else {
            // Authentification échouée
            this.errorMessage = res.message || 'NetID ou mot de passe invalide.';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Erreur serveur, veuillez réessayer plus tard.';
        }
      });
  }
}
