import { Component } from '@angular/core';
import { SerijeService } from '../serije/serije.service';
import { environment } from '../../environments/envirnoment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GithubService } from '../../servisi/github.service';

@Component({
  selector: 'app-favoriti',
  templateUrl: './favoriti.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss'],
})
export class FavoritiComponent {
  token: string = '';
  loggedIn: boolean = false;
  githubKorisnik: boolean = false;
  korime: string = '';
  ispis: string = 'Nemaš favorita!';
  favoriti: any[] = [];

  nijeSlika: boolean = true;
  nijePoveznica: boolean = true;
  nijeSlikaIliPoveznica: boolean = true;

  constructor(private serijeService: SerijeService, private http: HttpClient, private router: Router, private githubService: GithubService){}

  async ngOnInit(): Promise<void> {
    await this.provjeriGithub();
    this.provjeriJWT();
  }

  getFavoritiKeys(favoriti: any): string[]{
    return Object.keys(favoriti);
  }

  async provjeriJWT() {
    let token = await this.serijeService.dajToken();
    console.log("token: ", token);
    if (token != '0000' && this.githubKorisnik == false) {
      this.korime = this.serijeService.korime;
      this.token = token;
      this.loggedIn = true;
      this.dohvatiFavorite();
    } else if(token != '0000' && this.githubKorisnik == true){
      this.dohvatiFavoriteGithub();
    }
  }

  async provjeriGithub() {
    let githubLogin = await this.githubService.provjeriGithub();
    if(githubLogin){
      this.loggedIn = true;
      this.githubKorisnik = true;
    }
  }

  async prikaziFavorite(favoritiJSON: Record<string, any>): Promise<void> {
    if(favoritiJSON){
      this.favoriti = favoritiJSON as any;
      console.log("favoriti: ", this.favoriti);
      if(this.favoriti.length != 0) this.ispis = '';
    }
  }

  async dohvatiFavorite(){
    let dohvatiFavorite = await fetch(environment.restServis+'baza/favoriti/', {
      credentials: 'include'
    });
    let favoritiJSON = await dohvatiFavorite.json();
    this.prikaziFavorite(favoritiJSON);
  }

  async dohvatiFavoriteGithub(){
    if (typeof Storage !== 'undefined') {
      const spremljeniFavoriti = localStorage.getItem('favoritiLocalStorage');
      const favoritiLocalStorage = spremljeniFavoriti ? JSON.parse(spremljeniFavoriti) : [];

      this.prikaziFavorite(favoritiLocalStorage);
    } else {
      this.ispis = 'Vaš preglednik ne podupire local storage!';
    }
  }

  preusmjeri(idSerije: number) {
    console.log("idserije: ", idSerije);
    this.router.navigate([`/favoriti-detalji/${idSerije}`]);
    //this.router.navigate(['/favoriti-detalji', idSerije]);
  }
}
