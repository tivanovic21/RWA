const Baza = require("./baza.js");

class KorisnikDAO {

	constructor() {
		this.baza = new Baza("../RWA2023tivanovic21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnik;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	daj = async function (korime) {
		await this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnik WHERE korime=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		if(podaci.length == 1){
			this.baza.zatvoriVezu();
			return podaci[0];
		}
		else {
			this.baza.zatvoriVezu();
			return null;
		}
	}

	dodaj = async function (korisnik) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO korisnik (ime,prezime,lozinka,email,korime,adresa,postanskiBroj,brojMobitela,tip_korisnika_id) VALUES (?,?,?,?,?,?,?,?,?)`;
        let podaci = [korisnik.ime,korisnik.prezime,korisnik.lozinka,korisnik.email,korisnik.korime,korisnik.adresa,korisnik.postanskiBroj,korisnik.brojMobitela,2];
		await this.baza.izvrsiUpit(sql,podaci).catch((err) => console.log("greskica: ", err));
		this.baza.zatvoriVezu();
		return true;
	}

	obrisi = async function (korime) {
		console.log("obrisikorisnika: ", korime);
		this.baza.spojiSeNaBazu();
		let dohvatiKorisnikId = 'SELECT id FROM korisnik WHERE korime=?';
		let korisnikId = await this.baza.izvrsiUpit(dohvatiKorisnikId, [korime]);
		console.log("korisnikId: ", korisnikId[0].id);
		if(korisnikId.length > 0){
			let dohvatiFavoriteKorisnika = 'SELECT * FROM favoriti WHERE korisnik_id=?';
			let favoriti = await this.baza.izvrsiUpit(dohvatiFavoriteKorisnika, [korisnikId[0].id]);
			if(favoriti.length > 0){
				console.log("ima favorite!");
				let izbrisiFavorite = 'DELETE FROM favoriti WHERE korisnik_id=?';
				await this.baza.izvrsiUpit(izbrisiFavorite, [korisnikId[0].id]);

				let izbrisiKorisnika = 'DELETE FROM korisnik WHERE korime=?';
				await this.baza.izvrsiUpit(izbrisiKorisnika, [korime]);
				this.baza.zatvoriVezu();
				return true;
			} else {
				console.log("nema favorite!");
				let izbrisiKorisnika = 'DELETE FROM korisnik WHERE korime=?';
				await this.baza.izvrsiUpit(izbrisiKorisnika, [korime]);
				this.baza.zatvoriVezu();
			}
		} else {
			console.log("nije pronaden korisnik!");
			this.baza.zatvoriVezu();
			return false;
		}
	}

	azuriraj = async function (korime, korisnik) {
		console.log("azuriraj korime: ", korime);
		console.log("azuriraj korisnik: ", korisnik);
		this.baza.spojiSeNaBazu();
		let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, email=?, adresa=?, postanskiBroj=?, brojMobitela=?, totp=?, hoce2fa=? WHERE korime=?`;
        let podaci = [korisnik.ime,korisnik.prezime,
                      korisnik.lozinka,korisnik.email,korisnik.adresa,korisnik.postanskiBroj,korisnik.brojMobitela,korisnik.totp,korisnik.hoce2fa,korime];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();
		return true;
	}
}

module.exports = KorisnikDAO;
