import { Component, OnInit, ViewEncapsulation, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { SerijeService } from './serije.service';
import { SerijeTmdbI, SerijaTmdbI } from '../../servisi/SerijeTmdbI';
import { GithubService } from '../../servisi/github.service';

@Component({
  selector: 'app-serije',
  templateUrl: './serije.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/form.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SerijeComponent implements OnInit {
  loggedIn: boolean = false;
  ispis = '';
  filter: string = '';
  str: number = 1;
  ukupno: number = 1;
  serijeData: any[] = [];

  /*@Output() izabranaSerija = new EventEmitter<SerijaTmdbI>();
  onSeriesClick(series: SerijaTmdbI):void {
    console.log("onSeriesClick: ", series);
    this.izabranaSerija.emit(series);
  }*/

  constructor(private serijeService: SerijeService, private el: ElementRef, private renderer: Renderer2, private githubService: GithubService) {}

  naClick(novaStranica: number): void {
    console.log("stranica: ", novaStranica);
    this.str = novaStranica;
    this.dohvatiSerije();
  }

  ngOnInit(): void {
    this.provjeriToken();
    this.dohvatiSerije();
  }

  naInput() {
    if(this.filter.length>=3){
      this.dohvatiSerije();
    } else {
      this.ocistiStranicu();
    }
  }

  ocistiStranicu(){
    let stranicenje = this.el.nativeElement.querySelector("#stranicenje");
    let sadrzaj = this.el.nativeElement.querySelector("#sadrzaj");
    if(stranicenje && sadrzaj){
      this.renderer.setProperty(stranicenje, 'innerHTML', '');
      this.renderer.setProperty(sadrzaj, 'innerHTML', '');
    }
  }

  naPromjenuStranice(novaStranica: number): void {
    this.str = novaStranica;
    this.dohvatiSerije();
  }

  async dohvatiSerije() {
    if (this.filter.length >= 3) {
      this.serijeService.dajSerije(this.str, this.filter).subscribe(
        async (data) => {
          console.log("data: ", data);
          let brojPoStranici = await this.serijeService.dajStranicenje();
          this.ukupno = data.total_results;

          let prikazaniPodaci = this.serijeService.prikaziPodatke(data, this.str, this.ukupno, brojPoStranici);
          this.prikaziSerije(prikazaniPodaci);

          let strString: string = this.str.toString();
          let ukupnoString: string = Math.ceil(this.ukupno / brojPoStranici).toString();
          this.prikaziStranicenje(strString, ukupnoString);
        },
        (error) => {
          console.error('Error u fetchanju serije: ', error);
        }
      );
    }
  }

  prikaziSerije(serije: any) {
    let glavna = document.getElementById("sadrzaj");
  
    if (glavna) {
      let tablicaContainer = document.createElement('div');
      let tablica = '<table border=1>';
      
      tablica += "<tr><th>Id</th><th>Jezik</th><th>Naslov original</th><th>Naslov</th><th>Opis</th><th>Poster</th><th>Datum</th><th>Prikazi detalje</th></tr>";

      for (let s of serije) {
        tablica += "<tr>";
        tablica += "<td>" + s.id + "</td>";
        tablica += "<td>" + s.original_language + "</td>";
        tablica += "<td>" + s.original_name + "</td>";
        tablica += "<td>" + s.name + "</td>";
        tablica += "<td>" + s.overview + "</td>";
        tablica += "<td><img src='https://image.tmdb.org/t/p/w600_and_h900_bestv2/" +
          s.poster_path +
          "' width='100' alt='slika_" +
          s.original_name +
          "'/></td>";
        tablica += "<td>" + s.first_air_date + "</td>";
        tablica += "<td><button id='detaljiBtn_" + s.id + "'>Detalji serije</button></td>";
        tablica += "</tr>";
      }
      
      tablica += "</table>";
    
      sessionStorage['dohvaceneSerije'] = JSON.stringify(serije);

      glavna.innerHTML = '';
      tablicaContainer.innerHTML = tablica;
      glavna.appendChild(tablicaContainer);

      for (let s of serije) {
        let detaljiButton = document.getElementById('detaljiBtn_' + s.id);
        if (detaljiButton) {
          detaljiButton.addEventListener('click', () => this.serijeService.detaljiSerije(s.id));
        }
      }
    }
  }
  

  prikaziStranicenje(str: string, ukupno: string) {
    let prikaz = this.el.nativeElement.querySelector("#stranicenje");
    if (prikaz) {
      this.renderer.setProperty(prikaz, 'innerHTML', '');

      let html = "";
      let strBroj: number = parseInt(str);
      let ukupnoBroj: number = parseInt(ukupno);

      if (strBroj > 1) {
        let button1 = this.renderer.createElement('button');
        this.renderer.setProperty(button1, 'innerHTML', '<<');
        this.renderer.listen(button1, 'click', () => this.PrikaziStranicu(1));
        this.renderer.appendChild(prikaz, button1);

        let button2 = this.renderer.createElement('button');
        this.renderer.setProperty(button2, 'innerHTML', '<');
        this.renderer.listen(button2, 'click', () => this.PrikaziStranicu(strBroj - 1));
        this.renderer.appendChild(prikaz, button2);
      }

      let trenutnoButton = this.renderer.createElement('button');
      this.renderer.setProperty(trenutnoButton, 'innerHTML', `${strBroj}/${ukupnoBroj}`);
      this.renderer.listen(trenutnoButton, 'click', () => this.PrikaziStranicu(strBroj));
      this.renderer.appendChild(prikaz, trenutnoButton);

      if (strBroj < ukupnoBroj) {
        let button3 = this.renderer.createElement('button');
        this.renderer.setProperty(button3, 'innerHTML', '>');
        this.renderer.listen(button3, 'click', () => this.PrikaziStranicu(strBroj + 1));
        this.renderer.appendChild(prikaz, button3);

        let button4 = this.renderer.createElement('button');
        this.renderer.setProperty(button4, 'innerHTML', '>>');
        this.renderer.listen(button4, 'click', () => this.PrikaziStranicu(ukupnoBroj));
        this.renderer.appendChild(prikaz, button4);
      }
    }
  }

  PrikaziStranicu(str: number) {
    console.log("str: ", str);
    this.str = str;
    this.dohvatiSerije();
  }

  async provjeriToken(): Promise<void> {
    try {
      const tokenStatus = await this.serijeService.dajToken();
      const githubLogin = await this.githubService.provjeriGithub();
      console.log('tokenStatus: ', tokenStatus);
      console.log("githublogin: ", githubLogin);

      if (tokenStatus === '0000' && !githubLogin) {
        this.loggedIn = false;
        this.ispis = 'Prijavi se kako bi koristio tražilicu!';
        console.log('Korisnik nije prijavljen');
      } else {
        this.ispis = '';
        this.loggedIn = true;
        console.log('Korisnik je prijavljen');
      }
    } catch (error) {
      console.error('Error u provjeri tokena: ', error);
    }
  }
}
