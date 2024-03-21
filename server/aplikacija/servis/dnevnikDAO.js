const Baza = require("./baza.js");

class DnevnikDAO {

	constructor() {
		this.baza = new Baza("../RWA2023tivanovic21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM dnevnik;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dodaj = async function (metode, datum, resurs, tijelo, korime) {
		this.baza.spojiSeNaBazu();
        let dohvatiKorID = 'SELECT id FROM korisnik WHERE korime=?';
        let korid = await this.baza.izvrsiUpit(dohvatiKorID, korime);
		if(korid.length > 0){
			this.baza.spojiSeNaBazu();
			let sql = `INSERT INTO dnevnik (metode, datum, resurs, tijelo, korisnik_id) VALUES (?,?,?, ?, ?)`;
			//console.log("korid[0].id: ", korid[0].id);
			let podaci = [metode, datum, resurs, tijelo, korid[0].id];
			await this.baza.izvrsiUpit(sql,podaci).catch((err) => console.log("greskica: ", err));
		} else {
			console.log("korisnik s tim idom ne postoji u bazi!");
			this.baza.zatvoriVezu();
			return false;
		}
		this.baza.zatvoriVezu();
		return true;
	}

}

module.exports = DnevnikDAO;
