const KlijentTMDB = require("./servis/klijentTMDB.js");

class SerijeZanroviPretrazivanje {

	constructor(apiKljuc){
		this.apiKljuc = apiKljuc;
	}

	async dohvatiSerije(zahtjev){
		let stranica = zahtjev.body.str;
		let kljucnaRijec = zahtjev.body.filter;
		let klijent = new KlijentTMDB(this.apiKljuc);
		let odgovor = await klijent.pretraziSerijePoKljucnimRijecima(kljucnaRijec, stranica);
		let podaci = JSON.parse(odgovor);
		return podaci;
	}

	async dohvatiDetalje(id){
		let klijent = new KlijentTMDB(this.apiKljuc);
		let odgovor = await klijent.dohvatiSeriju(id);
		let podaci = JSON.parse(odgovor);
		return podaci;
	}
}

module.exports = SerijeZanroviPretrazivanje;
