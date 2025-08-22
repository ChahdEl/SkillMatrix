import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from "@angular/material/snack-bar";
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
declare type MatSnackBarCustomActionTypes = 'OK' | 'INFO' | 'ERR';
@Injectable({
  providedIn: 'root'
})
export class UIService {

  constructor(private _snackBar: MatSnackBar,
              private spinner: NgxSpinnerService,
              private router: Router) {  
              }

  private currentToolbarState = false;
  private toolbarStateChanges = new BehaviorSubject<boolean>(this.currentToolbarState)
  public toolbarStateChanged: Observable<boolean> = this.toolbarStateChanges.asObservable();

  changeToolbarState(){
    this.toolbarStateChanges.next(!this.currentToolbarState);
  }

  private currentPageName = '';
  private currentPageNameChanges = new BehaviorSubject<string>(this.currentPageName)
  public currentPageNameChanged: Observable<string> = this.currentPageNameChanges.asObservable();

  setCurrentPageName(pageName:string){
    this.currentPageNameChanges.next(pageName)
  }

  
  openSnackBar(message:string, 
               action = 'Close', 
               duration = 5000, 
               horizontalPosition:MatSnackBarHorizontalPosition = 'end', 
               verticalPosition:MatSnackBarVerticalPosition = 'bottom', 
               actionType:MatSnackBarCustomActionTypes = 'INFO'){
    let panelClassName = '';            
    switch(actionType){
      case actionType = "OK":
        panelClassName = 'ok-snackbar'
        break;
      case actionType = "INFO":
        panelClassName = 'info-snackbar'
        break;
      case actionType = "ERR":
        panelClassName = 'nok-snackbar'
        break;
        
    }
    this._snackBar.open(
      message,
      action,
      {
        duration: duration,
        horizontalPosition: horizontalPosition,
        verticalPosition: verticalPosition,
        panelClass: panelClassName
      }
    )
  }
  openSpinner(){
    this.spinner.show();
  }
  closeSpinner(){
    this.spinner.hide();
  }
}
