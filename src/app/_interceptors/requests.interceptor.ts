import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { UIService } from '../_utility-services/ui.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private uiService: UIService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.uiService.openSpinner();
    return next.handle(request).pipe(
      catchError((err, caught) => {
        console.log(err);
        if(err.status){
          this.uiService.openSnackBar(err.error.error ?? err.message,'Close',3000, 'end', 'bottom', 'ERR')
          return throwError(() => new Error(err.message));
        }
        if (err instanceof HttpErrorResponse) {
          const applicationError = err.headers.get('Application-Error');
          if (applicationError) {
              return throwError(() => applicationError);
          }

          const serverError = (err.error) ? 
                              (err.error.error) ? err.error.error : err.error.ErrorMessage : "Application Error!"
          
          this.uiService.openSnackBar(serverError,'Close',3000, 'end', 'bottom', 'ERR')
          return throwError(() => serverError || err.message);
      }
      return throwError(() => new Error(err.message));
      }),
      finalize(() => {
        this.uiService.closeSpinner();
      })
    );
  }
}
