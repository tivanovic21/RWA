import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SerijeService } from '../serije/serije.service';
import { SerijaTmdbI, SezonaI } from '../../servisi/SerijeTmdbI';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/envirnoment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SerijeI } from '../../servisi/SerijeI';
import { GithubService } from '../../servisi/github.service';

@Component({
  selector: 'app-serija-detalji',
  templateUrl: './serija-detalji.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/form.scss'],
})
export class SerijaDetaljiComponent implements OnInit {
  @Input() serijaDetails: SerijaTmdbI | undefined;
  @Input() sezona: SezonaI | undefined;
  @Input() serijaIzBaze: SerijeI | undefined;
  loggedIn: boolean = false;
  githubKorisnik: boolean = false;
  korime: string = '';
  ispis: string = '';
  token: string = '';
  idSerijeIzBaze: number | null = null;

  constructor(
    private route: ActivatedRoute, 
    private serijeService: SerijeService, 
    private githubService: GithubService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idSerije = params['idSerije'];
      if (idSerije) {
        this.provjeriJWT();
        this.provjeriGithub();
        this.dohvatiDetaljeSerije(idSerije);
      }
    });
  }

  async provjeriJWT() {
    let token = await this.serijeService.dajToken();
    if (token != '0000') {
      this.token = token;
      this.loggedIn = true;
    }
  }

  async provjeriGithub() {
    let githubLogin = await this.githubService.provjeriGithub();
    if(githubLogin){
      this.loggedIn = true;
      this.githubKorisnik = true;
    }
  }

  async dohvatiDetaljeSerije(idSerije: number): Promise<void> {
    try {
      let detaljiSerije = await this.serijeService.detaljiSerije(idSerije);
      if (!this.serijaDetails) {
        this.serijaDetails = {} as SerijaTmdbI;
      }
      console.log("detaljiSerije: ", detaljiSerije);
      if (detaljiSerije) {
        this.serijaDetails.id = detaljiSerije.id;
        this.serijaDetails.original_name = detaljiSerije.original_name;
        this.serijaDetails.overview = detaljiSerije.overview;
        this.serijaDetails.number_of_seasons = detaljiSerije.number_of_seasons;
        this.serijaDetails.number_of_episodes = detaljiSerije.number_of_episodes;
        this.serijaDetails.popularity = detaljiSerije.popularity;
        this.serijaDetails.poster_path = environment.posteriPutanja + detaljiSerije.poster_path;
        this.serijaDetails.homepage = detaljiSerije.homepage;
        this.serijaDetails.seasons = detaljiSerije.seasons;
      }
    } catch (error) {
      console.error('Error u dohvaćanju detalja:', error);
    }
  }

  async dohvatiKorisnika() {
    let odgovor = await fetch(environment.restServis + "getJWT", {
      credentials: 'include'
    });
    let tekst = JSON.parse(await odgovor.text());
    this.korime = tekst.korime;

    const urlKorisnika = `${environment.restServis}baza/korisnici/${this.korime}`;
    const odgovorKorisnik = await fetch(urlKorisnika, { credentials: 'include' });
    const podaciKorisnik = await odgovorKorisnik.json();
    const korisnikId = podaciKorisnik.id;
    return korisnikId;
  }

  async provjeriJeLiUbazi(idSerije: number) {
    const urlSerija = environment.restServis + 'baza/serije/' + idSerije;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let options = { headers, withCredentials: true };
    const odgovorSerije = await this.http.get(urlSerija, options).toPromise();
    return odgovorSerije;
  }

  async provjeriJeLiUfavoritima(odgovorSerije: object | undefined) {
    console.log("odgovrSerije provjeri jel u favoritima: ", odgovorSerije);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let options = { headers, withCredentials: true };
    let provjeriFavorite = await this.http.get(`${environment.restServis}baza/favoriti/${(odgovorSerije as SerijaTmdbI).id}`, options).toPromise();
    console.log("provjerifavorite odgovor: ", provjeriFavorite)
    return provjeriFavorite;
  }

  async dodajUbazu() {
    const serija = this.serijaDetails;
    console.log("serija dodaj u bazu: ", this.serijaDetails);
    let opis = {
      naziv: serija!.original_name,
      opis: serija!.overview,
      broj_sezona: serija!.number_of_seasons,
      broj_epizoda: serija!.number_of_episodes,
      popularnost: serija!.popularity,
      slika: serija!.poster_path,
      poveznica: serija!.homepage,
      tmdb_id: serija!.id
    }
    console.log("opis: ", opis);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.token,
    };

    const odgovorDodavanja = await this.http.post<any>(environment.restServis + 'baza/serije', opis, { headers, withCredentials: true }).toPromise();
    return odgovorDodavanja;
  }

  async dodajUfavorite(korisnikId: number, idSerije: any) {
    console.log("korisnikId: ", korisnikId, "idserije: ", idSerije);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    console.log("odgovorSerije: ", idSerije);
    let body = {
      korisnik_id: korisnikId,
      serije_id: idSerije
    }
    let options = { headers, withCredentials: true };
    const odgdodfav = await this.http.post<any>(`${environment.restServis}baza/favoriti`, body, options).toPromise();
    return odgdodfav;
  }

  async dodajSezonu(sezona: any, serijaId : any) {
    console.log("serija: ", serijaId);
    const body = {
      naziv: (sezona as SezonaI).name,
      opis: (sezona as SezonaI).overview,
      broj_sezone: (sezona as SezonaI).season_number,
      broj_epizoda_sezone: (sezona as SezonaI).episode_count,
      slika: (sezona as SezonaI).poster_path,
      tmdb_id_sezone: (sezona as SezonaI).id,
      serije_id: serijaId,
    };
    console.log("body u dodaj sezonu: ", body);
    const odgovorDodavanjaSezone = await this.http.post<any>(
      `${environment.restServis}baza/sezona`,
      body,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
    ).toPromise();
    console.log("odgovordodavanjasezone u dodajsezonu: ", odgovorDodavanjaSezone);
    return odgovorDodavanjaSezone;
  }

  async dodajFavoritGithub() {
    const idSerije = (this.serijaDetails as SerijaTmdbI).id;
    if (typeof Storage !== 'undefined') {
      const spremljeniFavoriti = localStorage.getItem('favoritiLocalStorage');
      const favoritiLocalStorage = spremljeniFavoriti ? JSON.parse(spremljeniFavoriti) : [];

      const existingFavorite = favoritiLocalStorage.find((favorite: SerijaTmdbI) => favorite.id === idSerije);
  
      if (existingFavorite) {
        this.ispis += 'Serija se već nalazi u favoritima!';
      } else {
        favoritiLocalStorage.push(this.serijaDetails);
  
        localStorage.setItem('favoritiLocalStorage', JSON.stringify(favoritiLocalStorage));
        this.ispis += 'Serija uspješno dodana u favorite!';
      }
    } else {
      this.ispis += 'Vaš preglednik ne podržava local storage.';
    }
  }
  


  async dodajFavorit(idSerije: number) {

    if(this.githubKorisnik) this.dodajFavoritGithub();
    else {
    const urlSerija = environment.restServis + 'baza/serije/' + idSerije;
    const odgovorSerije = await this.provjeriJeLiUbazi(idSerije);
    console.log("odgovorSerije: ", odgovorSerije);
    if(odgovorSerije && 'id' in odgovorSerije){
      console.log("odgovorSerije.id: ", odgovorSerije.id);
      (this.idSerijeIzBaze as number) = (odgovorSerije.id as number);
    }

    if (odgovorSerije !== null) {
      let provjeriFavorite = await this.provjeriJeLiUfavoritima(odgovorSerije);
      console.log("provjerifavorite: ", provjeriFavorite);
      if (provjeriFavorite !== null) {
        this.ispis += "Serija se već nalazi u favoritima!";
      } else {
        const korisnikId = await this.dohvatiKorisnika();
        let rezdodfav = await this.dodajUfavorite(korisnikId, this.idSerijeIzBaze);
        console.log("rezdodfav: ", rezdodfav);
        if (rezdodfav == 'true') {
          this.ispis += "Serija uspješno dodana u favorite!";
          for(const sezona of (this.serijaDetails as any).seasons){
            console.log("sezona: ", sezona);
            const odgovorDodavanjaSezone = await this.dodajSezonu(sezona, this.idSerijeIzBaze);
            console.log("odgovordodavanjasezone: ", odgovorDodavanjaSezone);
            if(odgovorDodavanjaSezone == 'true'){
              this.ispis += "Sezona uspješno dodana u bazu podataka!";
            }
          }
        }
      }
    } else {
      let odgovorDodavanjaPromise = await this.dodajUbazu();
      const odgovorDodavanja = await odgovorDodavanjaPromise;
      const korisnikId = await this.dohvatiKorisnika();
      if(odgovorDodavanja == 'true'){
        this.ispis += 'Serija uspješno dodana u bazu podataka!';
        const odgovorserije2 = await this.provjeriJeLiUbazi(idSerije);
        console.log("odgovorserije2: ", odgovorserije2);
        if(odgovorserije2 && 'id' in odgovorserije2){
          (this.idSerijeIzBaze as number) = odgovorserije2.id as number;
          console.log("idserijeizbaze: ", this.idSerijeIzBaze);
          const odgovorDodavanjaFavorita = await this.dodajUfavorite(korisnikId, this.idSerijeIzBaze);
          if(odgovorDodavanjaFavorita == 'true'){
            this.ispis += 'Serija uspješno dodana u favorite!';
            for(const sezona of (this.serijaDetails as any).seasons){
              const odgovorDodavanjaSezone = await this.dodajSezonu(sezona, this.idSerijeIzBaze);
              if(odgovorDodavanjaSezone == 'true'){
                this.ispis += "Sezona uspješno dodana u bazu podataka!";
              }
            }
          }
        }
      }
    }
  }
    }
}

@NgModule({
  declarations: [SerijaDetaljiComponent],
  imports: [CommonModule],
})
export class SerijaDetaljiModule {}
