import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppContentRoutingModule } from './app-content-routing.module';
import { AppContentComponent } from './app-content.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { TopnavComponent } from './topnav/topnav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { PageInformationComponent } from '../shared/page-information/page-information.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LeaderProfileComponent } from './leader-profile/leader-profile.component';
import { LevelDetailsComponent } from './level-details/level-details.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { OperatorStationsComponent } from './operator-stations/operator-stations.component';
import { ProfileComponent } from './profile/profile.component';
import { CodeVerificationDialogComponent } from './code-verification-dialog/code-verification-dialog.component';
import { ArchiveComponent } from './archive/archive.component';
import { DeleteMemberComponent } from './delete-member/delete-member.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OperatorsComponent } from './operators/operators.component';



@NgModule({
  declarations: [
    AppContentComponent,
    SidenavComponent,
    UserProfileComponent,
    TopnavComponent,
    LeaderProfileComponent,
    LevelDetailsComponent,
    CreateUserComponent,
    EditUserComponent,
    ConfirmationDialogComponent,
    NotificationDialogComponent,
    OperatorStationsComponent,
    ProfileComponent,
    CodeVerificationDialogComponent,
    ArchiveComponent,
    DeleteMemberComponent,
    OperatorsComponent,
  
  ],
  imports: [
    CommonModule,
    PageInformationComponent,
    AppContentRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,
    MatDialogModule,
    FormsModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ]
})
export class AppContentModule { }
