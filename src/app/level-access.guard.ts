import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from './app-content/notification-dialog/notification-dialog.component';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class LevelAccessGuard implements CanActivate {

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const requestedLevel = +route.paramMap.get('level')!;
    const matricule = +route.paramMap.get('mat')!;

    try {
      const userProfile:UserProfile = await firstValueFrom(this.apiService.GET_Operator_By_ID(matricule));
      const currentLevel = userProfile.currentLevel;

      if (requestedLevel <= currentLevel) {
        return true;
      } else {
        this.dialog.open(NotificationDialogComponent, {
          data: { message: `Please complete level ${currentLevel} before accessing level ${requestedLevel}.` }
        });

        this.router.navigate(['/application/user-profile', matricule]);
        return false; 
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return false; 
    }
  }
}
