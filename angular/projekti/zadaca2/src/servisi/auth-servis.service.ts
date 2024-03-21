import { Injectable } from '@angular/core';
import { environment } from '../environments/envirnoment';
import { KorisniciI } from '../app/korisnici/KorisniciI';

@Injectable({
  providedIn: 'root'
})

export class AuthServisService {

  baseUrl = environment.restServis;
  urlPrijava = environment.restServis+'prijava';
  urlRegistracija = environment.restServis+'registracija';
  urlOdjava = environment.restServis+'odjava';
  urlToken = environment.restServis+'getJWT';

  static prijavljeniKorisnik : KorisniciI | null = null;

  constructor() { }

  async prijavi(korime: string, lozinka: string){
    let zaglavlje = new Headers();
    zaglavlje.set('Content-Type', 'application/json');

    let parametri = {method: 'POST', body: JSON.stringify({'korime': korime, 'lozinka': lozinka}), headers: zaglavlje};
    let odgovor = (await fetch(this.urlPrijava, parametri)) as Response;

    console.log(odgovor);

    return odgovor;
  }

  async dajToken() {
    let odgovor = await fetch(this.baseUrl+"getJWT", {
      credentials: 'include'
    });
    let tekst = JSON.parse(await odgovor.text());
    if (tekst.ok != null) return tekst.ok;
    else return "0000";
  }

  async dajKorime() {
    let odgovor = await fetch(this.baseUrl+'getJWT', {credentials: 'include'});
    let tekst = JSON.parse(await odgovor.text());
    if(tekst.korime != null) return tekst.korime;
    else return 'Korisnik nije prijavljen!';
  }
}
