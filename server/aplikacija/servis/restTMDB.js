const TMDBklijent = require("./klijentTMDB.js");

class RestTMDB {
	constructor(api_kljuc) {
		//console.log("apikljuc: ", api_kljuc);
		if(api_kljuc == undefined){
			throw new Error('Api ključ se nije stigao učitat, refreshaj server!');
		} else {
			this.tmdbKlijent = new TMDBklijent(api_kljuc);
			this.tmdbKlijent.dohvatiSeriju(500).then().catch(console.log);
		}
	}

	getZanr(zahtjev, odgovor) {
		//console.log(this);
		this.tmdbKlijent
			.dohvatiZanrove()
			.then((zanrovi) => {
				odgovor.json(zanrovi);
			})
			.catch((greska) => {
				odgovor.json(greska);
			});
	}

	getSerije(zahtjev, odgovor) {
		console.log("zahtjev.query: ", zahtjev.query);
		//console.log("this: ", this);
		let stranica = zahtjev.query.stranica;
		let trazi = zahtjev.query.trazi;

		if (stranica == null || trazi == null) {
			odgovor.status(417).json({ greska: "neocekivani podaci" });
			return;
		}

		this.tmdbKlijent
			.pretraziSerijePoNazivu(trazi, stranica)
			.then((serije) => {
				console.log("serije tmdb klijent: ", serije);
				odgovor.send(serije);
			})
			.catch((greska) => {
				odgovor.json(greska);
			});
	}
}

module.exports = RestTMDB;
