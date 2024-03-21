import { Injectable } from '@angular/core';
import { environment } from '../environments/envirnoment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private http: HttpClient) { }

  getGithubAuthURL(): Observable<string>{
    return this.http.get<string>(`${environment.restServis}githubPrijava`, {withCredentials: true});
  }

  async provjeriGithub(){
    let odgovor = await fetch(`${environment.restServis}provjeriGithubPrijavu`, {credentials: 'include'});
    if(odgovor.ok){
      let podaci = await odgovor.json();
      return podaci.opis;
    }
  }
}
