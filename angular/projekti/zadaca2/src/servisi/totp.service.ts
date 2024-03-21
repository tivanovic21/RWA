import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/envirnoment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TotpService {

  constructor(private http: HttpClient) { }

  kreirajTotp(): Observable<any> {
    return this.http.get(`${environment.restServis}kreirajTotp`, { withCredentials: true });
  }
}
