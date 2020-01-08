import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, filter, take } from 'rxjs/operators';

import { RestService } from './rest.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;

    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(public auth: RestService) { }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.refreshTokenInProgress) {
            this.refreshTokenInProgress = true;
            this.refreshTokenSubject.next(null);

            return this.auth.authenticate().pipe(
                switchMap((token: any) => {
                    this.refreshTokenInProgress = false;
                    this.refreshTokenSubject.next(token.jwt);

                    return next.handle(this.addToken(request, token.jwt));
                }));
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(jwt => {
                    return next.handle(this.addToken(request, jwt));
                }));
        }
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token: string = localStorage.getItem('token');

        if (token) {
            request = this.addToken(request, token);
        }

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if (event.url.includes('exec')) {
                        if ((JSON.stringify(event.body).includes('Oops')) ||
                            (JSON.stringify(event.body).includes('Empty')) ||
                            (JSON.stringify(event.body).includes('Error')) ||
                            (JSON.stringify(event.body).includes('ERREUR, MySQL'))){
                            throw new HttpErrorResponse({ error: 'bar', status: 607 });
                        }
                        else if (JSON.stringify(event.body).includes('Connection timed out')){
                            throw new HttpErrorResponse({ error: 'bar', status: 608 });
                        }
                    }
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return this.handle401Error(request, next);
                } else {
                    console.log("##### erreur ds intercept : ######");
                    console.log("erreur statut : " + error.status);
                    console.log("erreur type : " + error.type);
                    console.log("erreur nom : " + error.name);
                    console.log("erreur message : " + error.message);
                    console.log("erreur url : " + error.url);
                    console.log("############ fin intercept #########");
                    return throwError(error);
                }
            }));
    }


}
