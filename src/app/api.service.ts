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

  // Centralized error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('An error occurred with the API request.'));
  }

  // Method to get Team Leaders
  GET_TeamLeaders(): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_TeamLeaders`)
      .pipe(catchError(this.handleError));
  }

  // Method to get Operators
  GET_Operators(): Observable<any> {
    return this.http.get<any>(`${this.APIURL}GET_Operators`)
      .pipe(catchError(this.handleError));
  }

  // Get Operators by Team Leader's NetID
  GET_Operators_By_TLNZ(NetID: string): Observable<any> {
    const params = new HttpParams().set('NetID', NetID);
    return this.http.get<any>(`${this.APIURL}GET_Operators_By_TLNZ`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get Operator by ID
  GET_Operator_By_ID(Matricule: number): Observable<any> {
    const params = new HttpParams().set('Matricule', Matricule.toString());
    return this.http.get<any>(`${this.APIURL}GET_Operator_By_ID`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get Levels by Operator's ID
  GET_Levels_By_Operator(Matricule: number): Observable<any> {
    const params = new HttpParams().set('Matricule', Matricule.toString());
    return this.http.get<any>(`${this.APIURL}GET_Levels_By_Operator`, { params })
      .pipe(catchError(this.handleError));
  }

  // Add a new operator
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

  // Add new operator levels
  addNewOperatorLevels(operatorMat: number, teamLeader: string, station: string): Observable<any> {
    const url = `${this.APIURL}Add_New_Operator_Levels`;
    const params = new HttpParams()
      .set('OperatorMat', operatorMat.toString())
      .set('TeamLeader', teamLeader)
      .set('Station', station);

    return this.http.post(url, null, { params })
      .pipe(catchError(this.handleError));
  }

  // Add operator and their levels together
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
      level,      // integer
      score,      // integer
      CurrentStation,
      answers     // array of booleans
    };

    return this.http.put(url, body).pipe(
      catchError(this.handleError)
    );
  }

  updateOperatorLevel(matricule: number, newLevel: number): Observable<any> {
    const url = `${this.APIURL}Update_Operator_Level`;

    const body = {
      matricule,  // integer
      newLevel     // integer
      // array of booleans
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

  verifyTechnicianNetID(code: string, pwd: string): Observable<boolean> {
    const url = `${this.APIURL}Get_verify`;
    const params = new HttpParams().set('code', code).set('pwd', pwd);

    return this.http.get<boolean>(url, { params }).pipe(
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

}
