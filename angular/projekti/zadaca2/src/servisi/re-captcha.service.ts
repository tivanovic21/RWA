import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/envirnoment';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class ReCaptchaService {

  constructor(
    private http: HttpClient
  ) { }

  async loadReCaptchaScript(): Promise<void> {
    let dohvati = await fetch(`${environment.restServis}dohvatiKljuceve`, {credentials: 'include'});
    let tekst = await dohvati.json();
    let recaptchaTokenIzKonf = tekst.recaptchaTokenIzKonf;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaTokenIzKonf}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('reCAPTCHA scripta dodana.');
    };

    document.head.appendChild(script);
  }


  async reCaptcha(): Promise<string> {
    let dohvati = await fetch(`${environment.restServis}dohvatiKljuceve`, {credentials: 'include'});
    let tekst = await dohvati.json();
    let recaptchaTokenIzKonf = tekst.recaptchaTokenIzKonf;

    return new Promise((uspjeh, neuspjeh) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(recaptchaTokenIzKonf, { action: 'submit' })
          .then((recaptchaToken: string) => {
            //console.log('reCAPTCHA odgovor:', recaptchaToken);
            uspjeh(recaptchaToken);
          })
          .catch((error: any) => {
            console.error('Error u recaptcha funkciji: ', error);
            neuspjeh(error);
          });
      });
    });
  }
}
