import { Injectable } from '@angular/core';
import { SerijaTmdbI, SerijeTmdbI } from './SerijeTmdbI';
import { environment } from '../environments/envirnoment';
import { SerijeI } from './SerijeI';

@Injectable({
  providedIn: 'root'
})
export class SerijeService {
  restServis = environment.restServis;
  serijeTMDB?: SerijeTmdbI;
  serije = new Array<SerijeI>();

  constructor() {
    let serije = localStorage.getItem('serije');
    if (serije == null) {
      this.osvjeziSerije(1, 'matrix');
    } else {
      this.serijeTMDB = JSON.parse(serije);
    }
  }

  async osvjeziSerije(stranica: Number, kljucnaRijec: String){
    let parametri = "?stranica="+stranica+"&kljucnaRijec="+kljucnaRijec;
    let odgovor = (await fetch(this.restServis+"tmdb/filmovi"+parametri)) as Response;
    if(odgovor.status == 200){
      let r = JSON.parse(await odgovor.text()) as SerijeTmdbI;
      console.log(r);
      this.serijeTMDB = r;
    }
  }
}
