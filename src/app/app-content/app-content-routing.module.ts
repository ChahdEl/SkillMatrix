import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppContentComponent } from './app-content.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProfileManagerComponent } from './profile-manager/profile-manager.component';
import { LeaderProfileComponent } from './leader-profile/leader-profile.component';
import { LevelDetailsComponent } from './level-details/level-details.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { LevelAccessGuard } from '../level-access.guard';
import { OperatorStationsComponent } from './operator-stations/operator-stations.component';
import { ProfileComponent } from './profile/profile.component';
import { ArchiveComponent } from './archive/archive.component';
import { DeleteMemberComponent } from './delete-member/delete-member.component';
import { OperatorsComponent } from './operators/operators.component';

const routes: Routes = [
  {
    path: '', 
    component: AppContentComponent,
    children: [
      {
        path: 'leader-profile',
        pathMatch: 'full',
        component: LeaderProfileComponent,
        
      },
      {
        path: 'profile',
        pathMatch: 'full',
        component: ProfileComponent,
        
      },
      {
        path: 'user-profile/:Matricule',
        component: UserProfileComponent,
        
      },
      {
        path: 'level-details',
        component: LevelDetailsComponent,
        
      },
      {
        path: 'profile-manager',
        component: ProfileManagerComponent,
        
      },
      {
        path: 'create-user',
        component: CreateUserComponent,
        
      },
      {
        path: 'edit-user/:Matricule',
        component: EditUserComponent,
        
      },
      {
        path: 'pageInfo',
        loadComponent: () => import('../shared/page-information/page-information.component')
        .then(x=>x.PageInformationComponent),        
      },
      { path: 'level-details/:mat/:level', component: LevelDetailsComponent, canActivate: [LevelAccessGuard] },

      { 
        path: 'operator-stations/:matricule', 
        component: OperatorStationsComponent 
      
      },
      {
        path:'archive',
        component:ArchiveComponent

      },
      {
        path:'operator',
        component:OperatorsComponent

      },
      {
        path:'delete',
        component:DeleteMemberComponent

      }

  
    ]
  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppContentRoutingModule { }
