import { Injectable } from '@angular/core';
import { environment } from '../environments/envirnoment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DnevnikService {

  urlDnevnik = environment.restServis+'baza/dnevnik';

  constructor(private http: HttpClient) { }

  async dohvatiPodatkeDnevnika(){
    let dohvatiDnevnik = await fetch(this.urlDnevnik, {
      credentials: 'include'
    });
    let dnevnikJSON = await dohvatiDnevnik.json();
    return dnevnikJSON;
  }
}
