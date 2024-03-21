import { Component } from '@angular/core';
import { KorisniciService } from '../korisnici/korisnici.service';
import { AuthServisService } from '../../servisi/auth-servis.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/envirnoment';
import { ReCaptchaService } from '../../servisi/re-captcha.service';
import { TotpService } from '../../servisi/totp.service';
import { GithubService } from '../../servisi/github.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/form.scss'],
})
export class ProfilComponent {

  totpOn: boolean = false;
  vecImaTotp: boolean = false;
  ukljuciCheckbox: boolean = false;
  totpVrijednost: string = '';
  qrKodUrl: string = '';

  loggedIn: boolean = false;
  githubKorisnik: boolean = false;
  hashiraj: boolean = false;
  token: string = '';
  korime: string = '';
  ispis: string = '';
  uspjeh: string = '';

  ime: string = '';
  prezime: string = '';
  korisnickoIme: string = '';
  email: string = '';
  hashiranaLozinka: string = '';
  lozinka: string = '';
  adresa: string = '';
  postanskiBroj: string = '';
  brojMobitela: string = '';
  tip_korisnika_id: string = '';
  totp: string = '';

  placeholder: string = '';

  constructor(
    private korisniciService: KorisniciService, 
    private authService: AuthServisService, 
    private http: HttpClient, 
    private reCaptchaService: ReCaptchaService,
    private totpService: TotpService,
    private githubService: GithubService,
    ){}

  async ngOnInit(): Promise<void> {
    await this.dohvatiToken();
    if(this.korime != '') {
      await this.provjeriGithub();
      if(! this.githubKorisnik){
        await this.prikaziPodatke(this.korime);
        if(this.totpVrijednost != null){
          this.vecImaTotp = true;
          console.log("već ima totp!");
          console.log("totpvrijednost: ", this.totpVrijednost);
        } else this.vecImaTotp = false;
      }
    }
    this.reCaptchaService.loadReCaptchaScript();
  }

  async provjeriGithub() {
    let githubLogin = await this.githubService.provjeriGithub();
    if(githubLogin){
      this.loggedIn = true;
      this.githubKorisnik = true;
    }
  }

  async dohvatiToken(){
    let token = await this.authService.dajToken();
    if (token != '0000') {
      this.token = token;
      this.loggedIn = true;
      this.korime = await this.authService.dajKorime();
    }
  }

  async prikaziPodatke(korime: string){
    let podaci = await this.korisniciService.dajPodatkeKorisnika(korime);
    if(podaci != null){
      this.ime = podaci.ime;
      this.prezime = podaci.prezime;
      this.korisnickoIme = podaci.korime;
      this.email = podaci.email;
      this.hashiranaLozinka = podaci.lozinka;
      this.adresa = podaci.adresa;
      this.postanskiBroj = podaci.postanskiBroj;
      this.brojMobitela = podaci.brojMobitela;
      this.tip_korisnika_id = podaci.tip_korisnika_id;
      this.lozinka = '';
      this.totpVrijednost = podaci.totp;
      this.ukljuciCheckbox = podaci.hoce2fa;
    }
  }

  async validiraj(): Promise<void> {
    const nijePrazan = /\S/;
    const samoSlova = /^[a-zA-Z]+$/;
    const samoBrojevi = /^\d+$/;
    const plusIBrojevi = /^\+?\d+$/;
    const validanEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let prolaziValidaciju = true;

    const checkbox2FA = document.getElementById('dvaFA') as HTMLInputElement;
    if (checkbox2FA.checked) {
      console.log('hoće 2FA');
      console.log("this.vecimatotp: ", this.vecImaTotp);
      if(!this.vecImaTotp){
        await this.ukljuci2FA();
      } else {
        console.log("vec ima totp pa ne radi novi!");
        console.log("dosadasnji totp: ", this.totpVrijednost)
      }
    } else {
      console.log('neće 2FA');
      this.iskljuci2FA();
    }

    if(!nijePrazan.test(this.korime) || !nijePrazan.test(this.email)){
      this.ispis = 'Korisničko ime i email su obavezni!';
      this.lozinka = '';
      prolaziValidaciju = false;
    } else {
      if(!nijePrazan.test(this.lozinka)){
        this.lozinka = this.hashiranaLozinka;
        this.hashiraj = false;
      } else if(nijePrazan.test(this.lozinka)){
        this.hashiraj = true;
      }

      if(!validanEmail.test(this.email)){
        this.ispis = 'Email nije validan!';
        this.lozinka = '';
        prolaziValidaciju = false;
      }
      if(nijePrazan.test(this.ime) && !samoSlova.test(this.ime)){
        this.ispis = 'Ime smije imati samo slova!';
        this.lozinka = '';
        prolaziValidaciju = false;
      }
      if(nijePrazan.test(this.prezime) && !samoSlova.test(this.prezime)){
        this.ispis = 'Prezime smije imati samo slova!';
        this.lozinka = '';
        prolaziValidaciju = false;
      }
      if(nijePrazan.test(this.brojMobitela) && !plusIBrojevi.test(this.brojMobitela)){
        this.ispis = 'Broj mobitela smije imati samo brojeve i + simbol!';
        this.lozinka = '';
        prolaziValidaciju = false;
      }
      if(nijePrazan.test(this.postanskiBroj) && !samoBrojevi.test(this.postanskiBroj)){
        this.ispis = 'Postanski broj smije imati samo brojeve!';
        this.lozinka = '';
        prolaziValidaciju = false;
      }
    }

    console.log("prolazi li validaciju: ", prolaziValidaciju);
    if(prolaziValidaciju){
      this.azurirajPodatke();
    }
  }

  async azurirajPodatke(){
    const recaptchaToken = await this.reCaptchaService.reCaptcha();
    //console.log('recaptchatoken: ', recaptchaToken);
    console.log("this.totpvrijednost azurirajPodatke angular: ", this.totpVrijednost);
    
    const userData = {
      korime: this.korime,
      email: this.email,
      lozinka: this.lozinka,
      ime: this.ime,
      prezime: this.prezime,
      brojMobitela: this.brojMobitela,
      postanskiBroj: this.postanskiBroj,
      adresa: this.adresa,
      totp: this.totpVrijednost,
      hoce2fa: this.ukljuciCheckbox,
      recaptchaToken: recaptchaToken
    };

    console.log("userdata: ", userData);

    try {
      let updateOdgovor = await this.http.put(`${environment.restServis}baza/korisnici/${this.korime}`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token,
          'Hashiraj': this.hashiraj.toString()
        },
        withCredentials: true,
        observe: 'response'
      }).toPromise();
      if(updateOdgovor?.status == 201){
        this.prikaziPodatke(this.korime);
        this.uspjeh = 'Podaci uspješno ažurirani!';
        this.ispis = '';
      }
    } catch (error) {
      console.error("Error u updateu:", error);
    }
    
  }

  async ukljuci2FA() {
    this.totpService.kreirajTotp().subscribe(
      (odgovor: any) => {
        this.totpVrijednost = odgovor.totpTajniKljuc;
        this.qrKodUrl = `otpauth://totp/zadaca2:${this.korime}?secret=${this.totpVrijednost}&issuer=zadaca2&algorithm=SHA512&digits=6&period=60`;
        console.log("qrkodurl: ", this.qrKodUrl);
        this.totpOn = true;
        this.vecImaTotp = true;
        console.log("totpvrijednost u ukljuci2fa: ", this.totpVrijednost);
      },
      (error) => {
        console.error('Error u kreiranju TOTPa: ', error);
      }
    );
  }

  async iskljuci2FA(){
    // this.totpVrijednost = '';
    this.totpOn = false;
    this.ukljuciCheckbox = false;
  };

}
