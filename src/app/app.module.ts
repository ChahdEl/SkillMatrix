import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppContentModule } from './app-content/app-content.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSpinnerModule } from "ngx-spinner";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerInterceptor } from './_interceptors/requests.interceptor';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { UserProfileComponent } from './app-content/user-profile/user-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileManagerComponent } from './app-content/profile-manager/profile-manager.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TopnavComponent } from './app-content/topnav/topnav.component';
import { ConfirmationDialogComponent } from './app-content/confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StringToNumberPipe } from './string-to-number.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { NotificationDialogComponent } from './app-content/notification-dialog/notification-dialog.component';
import { OperatorStationsComponent } from './app-content/operator-stations/operator-stations.component';
import { JwtModule } from '@auth0/angular-jwt';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    ProfileManagerComponent,
    StringToNumberPipe,
    
  ],
  exports: [
    StringToNumberPipe
  ],
  imports: [
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5114'], 
        disallowedRoutes: []
      }
    }),
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    AppContentModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,
    FormsModule,
    MatRadioModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true},
    {provide : LocationStrategy, useClass: HashLocationStrategy},
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
