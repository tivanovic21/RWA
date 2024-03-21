const Baza = require("./baza.js");

class SerijaDAO {

	constructor() {
		this.baza = new Baza("../RWA2023tivanovic21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serije;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

    dajSveSezone = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM sezona;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dajSpecSezonu = async function(id){
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM sezona WHERE serije_id=?";
		var podaci = await this.baza.izvrsiUpit(sql, [id]);
		this.baza.zatvoriVezu();
		return podaci;
	}

    dajSveFavorite = async function (korime) {
        this.baza.spojiSeNaBazu();
        let dohvatiKorisnikID = 'SELECT id FROM korisnik WHERE korime=?';
        let dohvatiPodatke = await this.baza.izvrsiUpit(dohvatiKorisnikID, korime);
		if(dohvatiPodatke.length > 0){
			let korisnikID = dohvatiPodatke[0].id;
			let sqlFavoriti = "SELECT * FROM favoriti WHERE korisnik_id=?";
			let podaciFavoriti = await this.baza.izvrsiUpit(sqlFavoriti, [korisnikID]);
			let skupPodataka = [];
			for (const favorit of podaciFavoriti) {
				let sqlSerije = "SELECT * FROM serije WHERE id=?";
				let podaciSerije = await this.baza.izvrsiUpit(sqlSerije, [favorit.serije_id]);
				skupPodataka.push(podaciSerije[0]);
			}
			this.baza.zatvoriVezu();
			console.log("skupPodataka: ", skupPodataka);
			return skupPodataka;
		} else {
			console.log("korisnik ne postoji u bazi!");
			this.baza.zatvoriVezu();
			return 'ne postoji';
		}
    }

	daj = async function (id) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serije WHERE tmdb_id=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [id]);
		this.baza.zatvoriVezu();
		if(podaci.length == 1){
			return podaci[0];
		}
		else
			return null;
	}

    dajFavorit = async function (id, korime) {
        this.baza.spojiSeNaBazu();
        let dohvatiKorisnikID = 'SELECT id FROM korisnik WHERE korime=?';
        let dohvatiPodatke = await this.baza.izvrsiUpit(dohvatiKorisnikID, korime);
		if(dohvatiPodatke.length > 0){
			let korisnikID = dohvatiPodatke[0].id;
			let sqlFavorit = "SELECT * FROM favoriti WHERE serije_id=? AND korisnik_id=?;";
			let podaciFavorit = await this.baza.izvrsiUpit(sqlFavorit, [id, korisnikID]);
			if (podaciFavorit.length === 1) {
				let sqlSerija = "SELECT * FROM serije WHERE id=?";
				let podaciSerije = await this.baza.izvrsiUpit(sqlSerija, [podaciFavorit[0].serije_id]);
				this.baza.zatvoriVezu();
				if (podaciSerije.length === 1) {
					return podaciSerije[0];
				}
			}
			this.baza.zatvoriVezu();
			return null;
		} else {
			console.log("korisnik nije u bazi!");
			this.baza.zatvoriVezu();
			return null;
		}
    }

	dodaj = async function (serija) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO serije (naziv, opis, broj_sezona, broj_epizoda, popularnost, slika, poveznica, tmdb_id)
        VALUES (?,?,?,?,?,?,?,?)`;
        let podaci = [serija.naziv,serija.opis,
                      serija.broj_sezona,serija.broj_epizoda,serija.popularnost,serija.slika,serija.poveznica,serija.tmdb_id];
		await this.baza.izvrsiUpit(sql,podaci).catch((err) => console.log("greskica: ", err));
		this.baza.zatvoriVezu();
		return true;
	}

    dodajSezonu = async function (sezona) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO sezona (naziv, opis, broj_sezone, broj_epizoda_sezone, slika, tmdb_id_sezone, serije_id)
        VALUES (?,?,?,?,?,?,?)`;
        let podaci = [sezona.naziv,sezona.opis,
                      sezona.broj_sezone,sezona.broj_epizoda_sezone,sezona.slika,sezona.tmdb_id_sezone, sezona.serije_id];
		await this.baza.izvrsiUpit(sql,podaci).catch((err) => console.log("greskica: ", err));
		this.baza.zatvoriVezu();
		return true;
	}

    dodajFavorit = async function (favorit) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO favoriti (korisnik_id, serije_id)
        VALUES (?,?)`;
        let podaci = [favorit.korisnik_id,favorit.serije_id];
		await this.baza.izvrsiUpit(sql,podaci).catch((err) => console.log("greskica: ", err));
		this.baza.zatvoriVezu();
		return true;
	}

	obrisi = async function (id) {
		this.baza.spojiSeNaBazu()
		let sql = "DELETE FROM favoriti WHERE serije_id=?";
		await this.baza.izvrsiUpit(sql,[id]);
		this.baza.zatvoriVezu();
		return true;
	}
}

module.exports = SerijaDAO;
