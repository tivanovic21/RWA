import { Component } from '@angular/core';
import { SerijeService } from '../serije/serije.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/envirnoment';
import { ActivatedRoute } from '@angular/router';
import { GithubService } from '../../servisi/github.service';

@Component({
  selector: 'app-favoriti-detalji',
  templateUrl: './favoriti-detalji.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/ul.scss'],
})
export class FavoritiDetaljiComponent {

  loggedIn: boolean = false;
  githubKorisnik: boolean = false;
  korime: string = '';
  token: string = '';
  idSerije: number | undefined;
  ispis: string = '';
  favoriti: any = {};
  sezone: any[] = [];

  constructor(private serijeService: SerijeService, private http: HttpClient, private route: ActivatedRoute, private githubService: GithubService) {}

  async ngOnInit(): Promise<void> {
    await this.provjeriGithub();
    this.provjeriJWT();
  }

  getFavoritiKeys(favoriti: any): string[]{
    return Object.keys(favoriti);
  }

  dohvatiIdSerije() {
    this.route.paramMap.subscribe(params => {
      this.idSerije = +params.get('id')!;
      console.log("idSerije braco: ", this.idSerije);
      if (this.idSerije != null) {
        if(this.githubKorisnik){
          this.dohvatiFavoriteGithub();
        } else {
          this.dohvatiFavorite();
        }
      }
    });
  }

  dohvatiFavoriteGithub(): void {
    if (typeof Storage !== 'undefined') {
      const spremljeniFavoriti = localStorage.getItem('favoritiLocalStorage');
      const favoritiLocalStorage = spremljeniFavoriti ? JSON.parse(spremljeniFavoriti) : [];
      this.prikaziFavoriteGithub(favoritiLocalStorage);
    } else {
      this.ispis = 'Vaš preglednik ne podupire local storage!';
    }
  }

  prikaziFavoriteGithub(favoritiLocalStorage: any[]): void {
    if (favoritiLocalStorage && favoritiLocalStorage.length > 0) {
      const favoritSIstimID = favoritiLocalStorage.find((favorite: any) => favorite.id === this.idSerije);
  
      if (favoritSIstimID) {
        this.ispis = '';
        this.favoriti = { ...favoritSIstimID };

        this.sezone = favoritSIstimID.seasons || [];
      } else {
        this.ispis = 'Nemaš favorita s traženim ID-om!';
      }
    } else {
      this.ispis = 'Nemaš favorita!';
    }
  }  

  async dohvatiFavorite() {
    try {
      let dohvatiFavorite = await this.http.get(`${environment.restServis}baza/favoriti/${this.idSerije}`, { withCredentials: true }).toPromise();
      this.favoriti = dohvatiFavorite;
      console.log("favoriti: ", this.favoriti);

      let dohvatiSezoneFavorita = await this.http.get(`${environment.restServis}baza/sezona/${this.idSerije}`, { withCredentials: true }).toPromise();
      this.sezone = dohvatiSezoneFavorita as any;
      console.log("sezone: ", this.sezone);

      if (this.favoriti != null) {
        this.ispis = '';
      }
    } catch (error) {
      console.error("Error u dohvaćanju data:", error);
      this.ispis = 'Pogreška prilikom dohvaćanja podataka.';
    }
  }

  async provjeriGithub() {
    let githubLogin = await this.githubService.provjeriGithub();
    if(githubLogin){
      this.loggedIn = true;
      this.githubKorisnik = true;
    }
  }

  async provjeriJWT() {
    try {
      let token = await this.serijeService.dajToken();
      console.log("token: ", token);
      if (token != '0000' && this.githubKorisnik == false) {
        this.korime = this.serijeService.korime;
        this.token = token;
        this.loggedIn = true;
        this.ispis = 'Izaberi favorite kako bi vidio detalje!';
        this.dohvatiIdSerije();
      } else if (token != '0000' && this.githubKorisnik == true){
        this.ispis = 'Izaberi favorite kako bi vidio detalje!';
        this.dohvatiIdSerije();
      } else {
        this.ispis = 'Prijavi se kako bi vidio svoje favorite!';
      }
    } catch (error) {
      console.error("Error u provjeri JWTa:", error);
      this.ispis = 'Pogreška prilikom provjere JWT tokena.';
    }
  }
}
