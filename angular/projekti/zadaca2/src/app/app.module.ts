import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { FormsModule } from '@angular/forms';

import { defaultEquals } from '@angular/core/primitives/signals';
import { SerijeComponent } from './serije/serije.component';
import { HttpClientModule } from '@angular/common/http';
import { SerijaDetaljiComponent } from './serija-detalji/serija-detalji.component';
import { KorisniciComponent } from './korisnici/korisnici.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { OdjavaComponent } from './odjava/odjava.component';
import { FavoritiComponent } from './favoriti/favoriti.component';
import { FavoritiDetaljiComponent } from './favoriti-detalji/favoriti-detalji.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { DnevnikComponent } from './dnevnik/dnevnik.component';
import { ProfilComponent } from './profil/profil.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations:[AppComponent, PrijavaComponent, SerijeComponent, OdjavaComponent, FavoritiComponent, FavoritiDetaljiComponent, KorisniciComponent, RegistracijaComponent, DnevnikComponent, ProfilComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule, QRCodeModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
