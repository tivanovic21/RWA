import { DoCheck, Component } from '@angular/core';
import { Location } from '@angular/common';
import { SerijaTmdbI } from '../servisi/SerijeTmdbI';
import { KorisnikI } from './korisnici/KorisniciI';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthServisService } from '../servisi/auth-servis.service';
import { GithubService } from '../servisi/github.service';
import { KorisniciService } from './korisnici/korisnici.service';
import { environment } from '../environments/envirnoment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../dizajn/nav.scss', '../dizajn/opcenito.scss', '../dizajn/table.scss']
})

export class AppComponent {
  naslov = "početna";
  putanja = 'pocetna';
  poruka = '';

  admin: boolean = false;
  prijavljen: boolean = false;
  githubKorisnik: boolean = false;
  dokumentacijaURL = environment.restServis+'dokumentacija';

  korisnikGost: KorisnikI = {
    id: 0,
    ime: '',
    prezime: '',
    korime: '',
    email: '',
    lozinka: '',
    tip_korisnika_id: 2,
    adresa: '',
    postanskiBroj: 0,
    brojMobitela: '',
    totp: ''
  };
  korisnik: KorisnikI = this.korisnikGost;

  constructor(
    private router: Router,
    private lokacija: Location,
    private authServis : AuthServisService,
    private githubService: GithubService,
    private korisniciService: KorisniciService,
    private authService: AuthServisService
  ){
    lokacija.onUrlChange((event) => {
      this.ngOnInit();
      console.log("promjena putanje: ", event);
    })
  } 

  async ngOnInit(){
    let token = await this.authService.dajToken();
    if(token !== '0000'){
      this.prijavljen = true;
      let github = await this.githubService.provjeriGithub();
      if(github){
        this.githubKorisnik = true;
      } else {
        let tipKorisnika = await this.korisniciService.dohvatiTipKorisnika();
        if(tipKorisnika == 1){
          this.admin = true;
        }
      }
    } else{
      this.prijavljen = false;
      this.githubKorisnik = false;
      this.admin = false;
    }
  }
}

