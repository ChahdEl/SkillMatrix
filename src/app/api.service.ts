import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { LeaderProfile, UserProfile } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly APIURL = "http://localhost:5114/";

  constructor(private http: HttpClient) { }
  
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('An error occurred with the API request.'));
  }

  
  GET_TeamLeaders(): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_TeamLeaders`)
      .pipe(catchError(this.handleError));
  }

  
  GET_Operators(): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_Operators`)
      .pipe(catchError(this.handleError));
  }

  
  GET_Operators_By_TLNZ(NetID: string): Observable<any> {
    const params = new HttpParams().set('NetID', NetID);
    return this.http.get<any>(`${this.APIURL}GET_Operators_By_TLNZ`, { params })
      .pipe(catchError(this.handleError));
  }

  
  GET_Operator_By_ID(Matricule: number): Observable<any> {
    const params = new HttpParams().set('Matricule', Matricule.toString());
    return this.http.get<any>(`${this.APIURL}GET_Operator_By_ID`, { params })
      .pipe(catchError(this.handleError));
  }

  
  GET_Levels_By_Operator(Matricule: number): Observable<any> {
    const params = new HttpParams().set('Matricule', Matricule.toString());
    return this.http.get<any>(`${this.APIURL}GET_Levels_By_Operator`, { params })
      .pipe(catchError(this.handleError));
  }

  
  addNewOperator(operator: UserProfile): Observable<any> {
    const url = `${this.APIURL}Add_New_Operator`;
    const params = new HttpParams()
      .set('Matricule', operator.Matricule.toString())
      .set('Name', operator.Name)
      .set('Project', operator.Project)
      .set('CurrentStation', operator.StationName)
      .set('CurrentLevel', operator.currentLevel)
      .set('teamLeader', operator.TeamLeader);

    return this.http.post(url, null, { params })
      .pipe(catchError(this.handleError));
  }

  
  addNewOperatorLevels(operatorMat: number, teamLeader: string, station: string): Observable<any> {
    const url = `${this.APIURL}Add_New_Operator_Levels`;
    const params = new HttpParams()
      .set('OperatorMat', operatorMat.toString())
      .set('TeamLeader', teamLeader)
      .set('Station', station);

    return this.http.post(url, null, { params })
      .pipe(catchError(this.handleError));
  }

  addOperatorWithLevels(operator: UserProfile): Observable<any> {
    return this.addNewOperator(operator).pipe(
      switchMap((response: any) => {
        console.log('Operator added:', response);
        return this.addNewOperatorLevels(operator.Matricule, operator.TeamLeader, operator.StationName);
      }),
      catchError(this.handleError)
    );
  }

  updateOperator(operator: UserProfile): Observable<any> {
    const url = `${this.APIURL}Update_Operator_By_Matricule`;
    const params = {
      Matricule: operator.Matricule.toString(),
      Name: operator.Name,
      Project: operator.Project,
      CurrentStation: operator.StationName,
      CurrentLevel: operator.currentLevel.toString(),
      TeamLeader: operator.TeamLeader
    };

    return this.http.put(url, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  checkLevelsByOperatorAndStation(matricule: number, station: string): Observable<boolean> {
    const url = `${this.APIURL}Check_Levels_By_OperatorAndStation`;
    const params = { Matricule: matricule.toString(), Station: station };

    return this.http.get<boolean>(url, { params }).pipe(
      catchError(this.handleError)
    );
  }

  GET_PastStations_By_Operator(Matricule: number): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_PastStations_By_Operator?Matricule=${Matricule}`);
  }

  updateLevelScoreAndAnswers(matricule: number, level: number, score: number, CurrentStation: string, answers: boolean[]): Observable<any> {
    const url = `${this.APIURL}Update_Level_Score_And_Answers`;

    const body = {
      matricule,
      level,      
      score,     
      CurrentStation,
      answers    
    };

    return this.http.put(url, body).pipe(
      catchError(this.handleError)
    );
  }

  updateOperatorLevel(matricule: number, newLevel: number): Observable<any> {
    const url = `${this.APIURL}Update_Operator_Level`;

    const body = {
      matricule,  
      newLevel 
    };

    return this.http.put(url, body).pipe(
      catchError(this.handleError)
    );
  }

  deleteOperatorByMatricule(matricule: number): Observable<any> {
    const url = `${this.APIURL}Update_Operator_IsActive`;
    const params = { Matricule: matricule.toString() };
    return this.http.put(url, null, { params }).pipe(
      catchError(error => {
        console.error('Error deleting operator:', error);
        return throwError(() => new Error('Failed to delete operator'));
      })
    );
  }

  GET_Disabled_Operators_By_TLNZ(NetID: string): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_Disabled_Operators_By_TLNZ?NetID=${NetID}`);
  }

  GET_Quit_Operators_By_TLNZ(NetID: string): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_Quit_Operators_By_TLNZ?NetID=${NetID}`);
  }

  verifyTechnicianNetID(code: string, pwd: string): Observable<boolean> {
  const url = `${this.APIURL}Get_verify`;
  const params = new HttpParams().set('code', code).set('pwd', pwd);

  return this.http.get<{ success: boolean; isValid: boolean }>(url, { params }).pipe(
    map(res => res.isValid), 
    catchError(error => {
      console.error('Verification failed:', error);
      return of(false);
    })
  );
}

updateLeader(leader:LeaderProfile):Observable<any>{
  const url = `${this.APIURL}Update_Leader_By_Matricule`;
    const params = {
      Matricule: leader.Matricule.toString(),
      Name: leader.Name,
      Project: leader.Project,
      Supervisor: leader.Supervisor,
      Zone: leader.Zone
    };

    return this.http.put(url, null, { params }).pipe(
      catchError(this.handleError)
    );
}
deleteOperator(matricule:Number):Observable<any>{
  const url = `${this.APIURL}Update_Operator_delete/${matricule}`;
    
    return this.http.put(url, null).pipe(
      catchError(error => {
        console.error('Error deleting operator:', error);
        return throwError(() => new Error('Failed to delete operator'));
      })
    );
}

}
