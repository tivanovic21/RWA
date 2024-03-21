import { Component } from '@angular/core';
import { environment } from '../../environments/envirnoment';
import { KorisniciService } from '../korisnici/korisnici.service';
import { SerijeService } from '../serije/serije.service';
import { DnevnikService } from '../../servisi/dnevnik.service';
import { AuthServisService } from '../../servisi/auth-servis.service';

@Component({
  selector: 'app-dnevnik',
  templateUrl: './dnevnik.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss'],
})
export class DnevnikComponent {
  admin: boolean = false;
  tip_korisnika_id: number = 0;
  ispis: string = '';
  token: string = '';
  dnevnikData: any[] = [];
  korisniciData: any[] = [];

  constructor(private dnevnikServices: DnevnikService, private korisniciService: KorisniciService, private authService: AuthServisService){}

  async ngOnInit(): Promise<void> {
    this.dohvatiToken();
    this.tip_korisnika_id = await this.korisniciService.dohvatiTipKorisnika();
    if (this.tip_korisnika_id == 1) {
      this.admin = true;
      this.prikaziPodatke();
    }
  }

  async dohvatiToken(){
    let token = await this.authService.dajToken();
    if (token != '0000') {
      this.token = token;
    }
  }

  async prikaziPodatke() {
    try {
      const [dnevnikData, korisniciData] = await Promise.all([
        this.dnevnikServices.dohvatiPodatkeDnevnika(),
        this.korisniciService.getKorisnici().toPromise()
      ]);

      if (dnevnikData && korisniciData) {
        this.dnevnikData = dnevnikData;
        this.korisniciData = korisniciData;

        const korisniciMap = new Map<number, any>();
        for (const korisnik of korisniciData) {
          korisniciMap.set(korisnik['id'], korisnik);
        }

        this.dnevnikData.forEach(podatak => {
          const korisnik = korisniciMap.get(podatak.korisnik_id);
          if (korisnik) {
            podatak.imeKorisnika = korisnik.korime;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  popraviDatum(unixZapis: number): string {
    const date = new Date(unixZapis);
    const formattedDate = new Intl.DateTimeFormat('hr-HR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    }).format(date);

    return formattedDate;
  }

}
