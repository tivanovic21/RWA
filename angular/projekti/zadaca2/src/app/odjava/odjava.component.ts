import { Component } from '@angular/core';
import { KorisniciService } from '../korisnici/korisnici.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/envirnoment';

@Component({
  selector: 'app-odjava',
  templateUrl: './odjava.component.html',
  styleUrls: ['../../dizajn/nav.scss', '../../dizajn/opcenito.scss', '../../dizajn/table.scss'],
})
export class OdjavaComponent {
  constructor(private korisniciServis : KorisniciService, private router: Router){}

  ngOnInit(): void {
    this.odjaviKorisnika();
  }

  async odjaviKorisnika(){
    const dohvatiToken = await fetch(environment.restServis+'getJWT', {
      credentials: 'include'
    });
    const odgovor = await dohvatiToken.json();
    if(odgovor.greska){
      console.log("korisnik nije prijavljen!");
      this.router.navigateByUrl('/');
    } else {
      let odjava = await fetch(environment.restServis+'odjava', {
        credentials: 'include'
      });
      if(odjava) this.router.navigateByUrl('/');
    }
  }
}
