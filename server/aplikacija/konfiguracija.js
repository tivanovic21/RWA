const ds = require("fs/promises");
class Konfiguracija {
	constructor() {
		this.konf = {};
	}
	dajKonf() {
		//console.log("this.konf: ", this.konf);
		return this.konf;
	}
	async ucitajKonfiguraciju() {
		let podaci = await ds.readFile(process.argv[2], "UTF-8");
		this.konf = pretvoriJSONkonfig(podaci);
		this.validiraj(this.konf);
	}

	validiraj() {
        const jwtValjanost = parseInt(this.konf.jwtValjanost);
        if (isNaN(jwtValjanost) || jwtValjanost < 15 || jwtValjanost > 3600) {
            throw new Error('jwtValjanost mora biti broj između 15 i 3600.');
        }

        const jwtTajniKljuc = this.konf.jwtTajniKljuc;
        const tajniKljucSesija = this.konf.tajniKljucSesija;
		if(jwtTajniKljuc.length > 100 || jwtTajniKljuc.length < 50){
			throw new Error('jwtTajniKljuc mora biti dužine između 50 i 100 znakova');
		} else if( !/^[a-zA-Z0-9]+$/.test(jwtTajniKljuc)){
			throw new Error('jwtTajniKljuc smije sadržavati samo velika i mala slova te brojeve')
		}
		if(tajniKljucSesija.length > 100 || tajniKljucSesija.length < 50){
			throw new Error('tajniKljucSesija mora biti dužine između 50 i 100 znakova.');
		} else if( !/^[a-zA-Z0-9]+$/.test(tajniKljucSesija)){
			throw new Error('tajniKljucSesija smije sadržavati samo velika i mala slova te brojeve')
		}

        const appStranicenje = parseInt(this.konf.appStranicenje);
        if (isNaN(appStranicenje) || appStranicenje < 5 || appStranicenje > 100) {
            throw new Error('appStranicenje mora biti broj između 5 i 100');
        }

        const tmdbApiKeyV3 = this.konf["tmdb.apikey.v3"];
        const tmdbApiKeyV4 = this.konf["tmdb.apikey.v4"];
        if (!tmdbApiKeyV3 || !tmdbApiKeyV4) {
            throw new Error('tmdbApiKeyV3 ili tmdbApiKeyV4 nisu učitani');
        }
    }
}

function pretvoriJSONkonfig(podaci) {
	//console.log("pretvori json kofnig:", podaci);
	let konf = {};
	var nizPodataka = podaci.split("\n");
	for (let podatak of nizPodataka) {
		var podatakNiz = podatak.split("=");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz[1];
		konf[naziv] = vrijednost;
	}
	return konf;
}

module.exports = Konfiguracija;
