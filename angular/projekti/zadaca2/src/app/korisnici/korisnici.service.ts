// korisnici.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { KorisniciI, KorisnikI } from './KorisniciI';
import { Router } from '@angular/router';
import { environment } from '../../environments/envirnoment';

@Injectable({
  providedIn: 'root',
})
export class KorisniciService {
  private url = environment.restServis;
  private greska : string = '';
  public prijavljeniKorisnik : KorisnikI = {id: 0, ime: '', prezime: '', korime: '', email: '', lozinka: '', adresa: '', postanskiBroj: 0, brojMobitela: '', tip_korisnika_id: 0, totp: ''};

  constructor(private http: HttpClient, private router: Router) {}

  async prijaviKorisnika(loginData: { korime: string; lozinka: string; }){
    try {
      const options = { withCredentials: true };
      const odgovor = await this.http.post(this.url+'prijava', loginData, { observe: 'response', ...options }).toPromise();      
      const odgovorBody = odgovor!.body;
      if (odgovor!.ok) {
        console.log("odgovorBody: ", odgovorBody);
        const token = (odgovorBody! as any).user.token;
        const provjereniToken = await this.provjeriToken(token);
        if(provjereniToken.ok == token){
          this.postaviPrijavljenogKorisnika(odgovorBody);
          this.router.navigateByUrl('/');
          return this.greska = '';
        } else {
          this.greska = 'pogreška prilikom provjere tokena!';
          return this.greska;
        }
      } else {
        this.greska = (odgovorBody as any)?.error.message || 'Nepoznata pogreška prilikom prijave.';
        console.log(this.greska);
        console.log(`Server error: ${odgovor!.status} - ${odgovor!.statusText}`);
        return this.greska;
      }
    } catch (error) { 
      let odgovorBody = (error! as any).error.message;
      this.greska = odgovorBody;
      console.log("greska:", this.greska);
      console.log("err: ", error);
      return this.greska;
    }
  }

  getKorisnici(): Observable<KorisniciI[]> {
    return this.http.get<KorisniciI[]>(this.url + 'baza/korisnici', { observe: 'response', withCredentials: true })
      .pipe(
        map((response: HttpResponse<KorisniciI[] | null>) => {
          if (response.status === 200) {
            console.log("response.body: ", response.body);
            return response.body || [];
          } else {
            throw new Error('Neautoriziran pristup');
          }
        }),
        catchError((error) => {
          console.error('Error fetching data:', error);
          throw new Error('Neautoriziran pristup');
        })
      );
  }
  

  async dohvatiTipKorisnika(){
    let dohvatiJWT = await fetch(environment.restServis+'getJWT', {credentials: 'include'});
    let odgovor = await dohvatiJWT.json();
    if(odgovor.ok){
      let korime = odgovor.korime;
      let dohvatiKorisnika = await fetch(environment.restServis+'baza/korisnici/'+korime, {credentials: 'include'});
      let odgovorKorisnika = await dohvatiKorisnika.json();
      if(odgovorKorisnika != null){
        let tip_korisnika_id = odgovorKorisnika.tip_korisnika_id;
        return tip_korisnika_id;
      }
    }
  }

  async dajPodatkeKorisnika(korime: string) {
    let odgovor = await fetch(`${environment.restServis}baza/korisnici/${korime}`, {credentials: 'include'});
    let tekst = JSON.parse(await odgovor.text());
    return tekst;
  }

  async provjeriToken(token: string) {
    const dohvati = await fetch(this.url+'getJWT', {
      headers: {
        'Authorization': `${token}`,
      },
      credentials: 'include'
    });
    const odgovor = await dohvati.json();
    return odgovor;
  }

  postaviPrijavljenogKorisnika(odgovorBody: Object | null) {
    if(this.prijavljeniKorisnik){
      this.prijavljeniKorisnik.id = (odgovorBody as any).user.id;
      this.prijavljeniKorisnik.ime = (odgovorBody as any).user.ime;
      this.prijavljeniKorisnik.prezime = (odgovorBody as any).user.prezime;
      this.prijavljeniKorisnik.korime = (odgovorBody as any).user.korime;
      this.prijavljeniKorisnik.email = (odgovorBody as any).user.email;
      this.prijavljeniKorisnik.lozinka = (odgovorBody as any).user.lozinka;
      this.prijavljeniKorisnik.adresa = (odgovorBody as any).user.adresa;
      this.prijavljeniKorisnik.brojMobitela = (odgovorBody as any).user.brojMobitela;
      this.prijavljeniKorisnik.postanskiBroj = (odgovorBody as any).user.postanskiBroj;
      this.prijavljeniKorisnik.tip_korisnika_id = (odgovorBody as any).user.tip_korisnika_id;
      this.prijavljeniKorisnik.totp = (odgovorBody as any).user.totp;
    }
  }

  async obrisi(korime: string){
    let odgovor = await this.http.delete(this.url+'baza/korisnici/'+korime, {withCredentials: true}).toPromise();
    if(odgovor){
      return true;
    } else {
      return false;
    }
  }
}

