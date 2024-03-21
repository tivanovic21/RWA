import { Component } from '@angular/core';
import { KorisniciService } from '../korisnici/korisnici.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/envirnoment';
import { SerijeService } from '../serije/serije.service';
import { Router } from '@angular/router';
import { ReCaptchaService } from '../../servisi/re-captcha.service';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/form.scss'],
})
export class RegistracijaComponent {
  admin: boolean = false;
  tip_korisnika_id: number = 0;
  ispis: string = '';
  token: string = '';

  korime: string = '';
  email: string = '';
  lozinka: string = '';
  ime: string = '';
  prezime: string = '';
  adresa: string = '';
  brojMobitela: string = '';
  postanskiBroj: string = '';

  constructor(
    private korisniciService: KorisniciService, 
    private http: HttpClient, 
    private serijeService: SerijeService,
    private router: Router,
    private reCaptchaService: ReCaptchaService
  ) {}

  async ngOnInit(): Promise<void> {
    this.dohvatiToken();
    this.tip_korisnika_id = await this.korisniciService.dohvatiTipKorisnika();
    if (this.tip_korisnika_id == 1) {
      this.admin = true;
      this.reCaptchaService.loadReCaptchaScript();
    }
  }

  async dohvatiToken(){
    let token = await this.serijeService.dajToken();
    if (token != '0000') {
      this.token = token;
    }
  }

  async validiraj() {
    const prazan = /\S/;
    const samoSlova = /^[a-zA-Z]+$/;
    const samoBrojevi = /^\d+$/;
    const plusIBrojevi = /^\+?\d+$/;
    const validanEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let prolaziValidaciju = true;

    if (!prazan.test(this.korime) || !prazan.test(this.email) || !prazan.test(this.lozinka)) {
      this.ispis = 'Korisničko ime, email i lozinka su obavezni!';
      prolaziValidaciju = false;
    } else if (!validanEmail.test(this.email)) {
      this.ispis = 'Email nije ispravan!';
      prolaziValidaciju = false;
    } else if (prazan.test(this.ime) && !samoSlova.test(this.ime)) {
      this.ispis = 'Ime smije imati samo slova!';
      prolaziValidaciju = false;
    } else if (prazan.test(this.prezime) && !samoSlova.test(this.prezime)) {
      this.ispis = 'Prezime smije imati samo slova!';
      prolaziValidaciju = false;
    } else if (prazan.test(this.brojMobitela) && !plusIBrojevi.test(this.brojMobitela)) {
      this.ispis = 'Broj nije ispravan!';
      prolaziValidaciju = false;
    } else if (prazan.test(this.postanskiBroj) && !samoBrojevi.test(this.postanskiBroj)) {
      this.ispis = 'Poštanski broj smije imati samo brojeve!';
      prolaziValidaciju = false;
    }

    if(prolaziValidaciju){
      try {
        let recaptchaToken = await this.reCaptchaService.reCaptcha();
        if (recaptchaToken != '') {
          this.registriraj();
        } else {
          this.ispis = 'Problem u dohvaćanju reCAPTCHA tokena!';
        }
      } catch (error) {
        console.error('Error in reCAPTCHA validaciji:', error);
        this.ispis = 'Greška u reCAPTCHA validaciji!';
      }
    }
  }

  async registriraj(){
    try {
      const recaptchaToken = await this.reCaptchaService.reCaptcha();
      //console.log("recaptchaToken u registriraj(): ", recaptchaToken);

      const userData = {
        korime: this.korime,
        email: this.email,
        lozinka: this.lozinka,
        ime: this.ime,
        prezime: this.prezime,
        adresa: this.adresa,
        brojMobitela: this.brojMobitela,
        postanskiBroj: this.postanskiBroj,
        recaptchaToken: recaptchaToken
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token,
      };
  
      const odgovorDodavanja = await this.http.post<any>(environment.restServis + 'registracija', userData, { headers, withCredentials: true }).toPromise();
      console.log("odgovorDodavanja: ", odgovorDodavanja);
      if (odgovorDodavanja == true) {
        this.router.navigate(['/']);
      }
      console.log(odgovorDodavanja);
    } catch (error) {
      console.error('Error u registraciji:', error);
    }
  }
}
