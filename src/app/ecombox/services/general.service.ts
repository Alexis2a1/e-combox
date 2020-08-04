import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RestService } from './rest.service';

const endpoint = 'http://llb.ac-corse.fr:11251/portainer/api/';

@Injectable({
  providedIn: 'root',
})

export class GeneralService {

  refreshInProgress: boolean = false;

  // Variables used for dashboard
  dashboardRefreshInProgress: boolean = false;
  diskSpaceDescription: string = 'Calcul en cours';
  memoryUsed: number = 0;
  cpuUsed: number = 0;
  nbContainers: number = 0;

  constructor(private http: HttpClient, private dockerService: RestService) {}

  getInfo(): Observable<any> {

    return this.http.get(endpoint + 'endpoints/1/docker/info')
      .pipe(
        catchError(this.handleError<any>('getContainers')),
      );
  }

  // Requête très longue on la lance donc au chargement inital de l'application
  getDataUsageInfo(): Observable<any> {
    return this.http.get(endpoint + 'endpoints/1/docker/system/df?stream=false')
      .pipe(
        catchError(this.handleError<any>('getContainers')),
      );
  }

  // URL à modifier après modifications sur le proxy
  getAnnounce(): Observable<any> {
    return this.http.get('https://cors-anywhere.herokuapp.com/https://gitlab.com/siollb/e-combox_scriptsutiles_siollb/-/raw/master/informations.json?inline=false')
      .pipe(
        catchError(this.handleError<any>('getInformationsMessage')),
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // tslint:disable-next-line:no-console
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  fileConvertSize(aSize: number): string {
    aSize = Math.abs(aSize);
    const def = [1, 1024, 1024 * 1024, 1024 * 1024 * 1024, 1024 * 1024 * 1024 * 1024];
    const lab = ['octets', 'ko', 'Mo', 'Go', 'To'];

    for (let i = 0; i < def.length; i++) {
      if (aSize < def[i]) {
        return (aSize / def[i - 1]).toFixed(2) + ' ' + lab[i - 1];
      }
    }
  }
}
