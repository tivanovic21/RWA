import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/envirnoment';
import { Router } from '@angular/router';
import { SerijaTmdbI } from '../../servisi/SerijeTmdbI';

@Injectable({
  providedIn: 'root',
})
export class SerijeService {
  private baseUrl = environment.restServis;
  public korime = '';

  constructor(private http: HttpClient, private router: Router) {}

  async dodajToken(parametri: any = {}): Promise<any> {
    let zaglavlje = new Headers();
    console.log("parametri: ", parametri);
  
    if (parametri.headers != null) zaglavlje = parametri.headers;
  
    let token = await this.dajToken();
    console.log("token: ", token);
    zaglavlje.set("Authorization", token);
    parametri.headers = zaglavlje;
    console.log("parametri: ", parametri);
    return parametri;
  }

  async dajToken() {
    let odgovor = await fetch(this.baseUrl+"getJWT", {
      credentials: 'include'
    });
    let tekst = JSON.parse(await odgovor.text());
    this.korime = tekst.korime;
    if (tekst.ok != null) return tekst.ok;
    else return "0000";
  }

  prikaziPodatke(data: any, str: number, ukupno: number, brojPoStranici: number): any[] {
    let remainingResults = ukupno;
    let clampedPage = ((Math.ceil(str) - 1) % Math.ceil(ukupno / brojPoStranici));
    let privremeno = clampedPage % (20 / brojPoStranici);
    let startIndex = privremeno * brojPoStranici;
    let endIndex = startIndex + Math.min(brojPoStranici, remainingResults);
    return data.results.slice(startIndex, endIndex);
  }

  async dajStranicenje(){
    let odgovor = await fetch(`${this.baseUrl}stranicenje`);
    let tekst = JSON.parse(await odgovor.text());
    return tekst.stranicenje;
  }

  dajSerije(str: number, filter: string): Observable<any> {
    return from(this.dajStranicenje()).pipe(
      switchMap((stranicenje) => {
        const body = {
          str: Math.ceil(str / (20 / stranicenje)),
          filter: filter,
        };
        return this.http.post(`${this.baseUrl}`, body, {withCredentials: true});
      })
    );
  }

  async detaljiSerije(idSerije: Number): Promise<SerijaTmdbI> {
    const tijelo = { idSerije };
    let odgovor: any = await this.http.post(`${environment.restServis}serijaDetalji`, tijelo, {withCredentials: true}).toPromise();
    if(odgovor){
      this.router.navigate(['/serijaDetalji'], { queryParams: {idSerije} });
      return odgovor;
    }
    throw new Error('odgovor ili status nije dobar!');
  }

  dajFilter(): string {
    var filterElement = document.getElementById("filter") as HTMLInputElement;
    var filterValue: string = filterElement?.value ?? '';
    return filterValue;
  }
}

