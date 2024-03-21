# RWA projekt

Full stack web aplikacija za pretraživanje filmova napravljena koristeći Node.js i Angular.

## Pokretanje aplikacije

Potrebno je preuzeti cijeli repozitor te imati instaliran Node.js i Angular na računalu.  
Nakon preuzimanja pozicionirati se u direktorij server.

```bash
cd server
```
Pokrenuti komandu za pokretanje servera.
```bash
npm start
```

Za pokretanje samo angular aplikacije potrebno se pozicionirati u angular direktorij.
```bash
cd angular
```
Pokrenuti komandu za instaliranje npm paketa.
```bash
npm install
```
Pokrenuti komandu za pokretanje projekta.
```bash
ng serve
```

## Mogućnosti aplikacije

Registracija je moguća samo administratoru.   
Prijava je moguća postojećem korisniku ili putem Github računa.  

Nakon prijave korisnik može pretraživati filmove, pregledati detalje za pojedine filmove te isti dodati u favorite. Moguće je izmjeniti podatke korištene tokom registracije kao i uključiti 2FA autentifikaciju. Uz to administrator ima uvid u sve korisnike gdje može ukloniti korisnika te može vidjeti dnevnik prijašnjih radnji na aplikaciji od strane svih korisnika.
