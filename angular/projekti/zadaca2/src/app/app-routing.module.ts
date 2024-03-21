import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrijavaComponent } from './prijava/prijava.component';
import { SerijeComponent } from './serije/serije.component';
import { OdjavaComponent } from './odjava/odjava.component';
import { SerijaDetaljiComponent } from './serija-detalji/serija-detalji.component';
import { FavoritiComponent } from './favoriti/favoriti.component';
import { FavoritiDetaljiComponent } from './favoriti-detalji/favoriti-detalji.component';
import { KorisniciComponent } from './korisnici/korisnici.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { DnevnikComponent } from './dnevnik/dnevnik.component';
import { ProfilComponent } from './profil/profil.component';

const routes: Routes = [
  //{ path: '*', redirectTo: '/' },
  { path: '', component: SerijeComponent },
  { path: 'prijava', component:PrijavaComponent },
  { path: 'odjava', component: OdjavaComponent }, 
  { path: 'serijaDetalji', component:SerijaDetaljiComponent },
  { path: 'favoriti', component:FavoritiComponent},
  { path: 'favoriti-detalji/:id', component: FavoritiDetaljiComponent },
  { path: 'korisnici', component: KorisniciComponent },
  { path: 'profil', component:ProfilComponent },
  { path: 'registracija', component:RegistracijaComponent },
  { path: 'dnevnik', component: DnevnikComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
