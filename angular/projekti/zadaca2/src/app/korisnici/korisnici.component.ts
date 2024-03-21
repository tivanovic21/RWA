import { Component, OnInit } from '@angular/core';
import { KorisniciService } from './korisnici.service';
import { KorisniciI, KorisnikI } from './KorisniciI';
import { SerijeService } from '../serije/serije.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/form.scss', '../../dizajn/ul.scss'],
})
export class KorisniciComponent implements OnInit {
  korisnici: KorisniciI[] | undefined;
  admin: boolean = false;
  tip_korisnika_id: number = 0;
  ispis: any = '';

  constructor(private korisniciService: KorisniciService, private serijeService: SerijeService) {}

  async ngOnInit(): Promise<void> {
    this.tip_korisnika_id = await this.korisniciService.dohvatiTipKorisnika();
    if (this.tip_korisnika_id == 1) {
      this.ispis = '';
      this.admin = true;
      this.korisniciService.getKorisnici().subscribe((data) => {
        this.korisnici = data;
      });
    }
  }

  getKorisnikKeys(korisnik: any): string[] {
    return Object.keys(korisnik);
  }

  async obrisiKorisnika(korime: any) {
    let brisanje = await this.korisniciService.obrisi(korime);
    if(brisanje){
      this.korisniciService.getKorisnici().subscribe((data) => {
        this.korisnici = data;
      });
    }
  }
}
