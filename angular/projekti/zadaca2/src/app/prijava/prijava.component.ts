import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from '../../environments/envirnoment'; 
import { AuthServisService } from '../../servisi/auth-servis.service';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { KorisniciService } from '../korisnici/korisnici.service';
import { ReCaptchaService } from '../../servisi/re-captcha.service';
import { GithubService } from '../../servisi/github.service';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss', '../../dizajn/zaPrijavu.scss'],
})
export class PrijavaComponent {

  korime? : string;
  lozinka? : string;
  totp? : string;
  greska: string = '';
  url = environment.restServis+'prijava';

  constructor(
    private authServis: AuthServisService,
    private http: HttpClient,
    private router: Router,
    private korisniciServis: KorisniciService,
    private reCaptchaService: ReCaptchaService,
    private githubService: GithubService
  ){}

  ngOnInit(): void {
    this.reCaptchaService.loadReCaptchaScript();
  }
  
  async prijavi() {
    console.log("korime: ", this.korime, ' lozinka: ', this.lozinka);
    const recaptchaToken = await this.reCaptchaService.reCaptcha();

    if(this.korime == undefined || this.regexPrazno(this.korime)){
      this.greska = 'Korisničko ime nije uneseno!\n';
    } else if (this.lozinka == undefined || this.regexPrazno(this.lozinka)){
      this.greska = 'Lozinka nije unesena!\n';
    } else {
      this.greska = '';

      const loginData = {
        korime: this.korime,
        lozinka: this.lozinka,
        recaptchaToken: recaptchaToken,
        totp: this.totp?.replace(' ', '')
      };
      
      try{
        let recaptchaToken = await this.reCaptchaService.reCaptcha();
        if(recaptchaToken != ''){
          let rezultat = this.korisniciServis.prijaviKorisnika(loginData);
          this.greska = (await rezultat).toString();
        } else console.log("greska u recaptchi!");
      } catch(error){
        console.error("Greska u recaptchi: ", error);
      }
      this.totp = '';
    } 
  }
  regexPrazno(str : string)
  {
    return /^\s*$/.test(str);
  }

  async githubPrijava() {
    this.githubService.getGithubAuthURL().subscribe(url => {
      console.log("githubprijava url: ", url);
      window.location.href = url;
    })
  }
}
