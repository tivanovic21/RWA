const SerijePretrazivanje = require("./serijePretrazivanje.js");
const jwt = require("./moduli/jwt.js");
const Autentifikacija = require("./autentifikacija.js");
const Konfiguracija = require("./konfiguracija.js");
const RestTMDB = require("./servis/restTMDB.js");
const totp = require("./moduli/totp.js")
const github = require("./moduli/github.js");
const konf = new Konfiguracija();
konf.ucitajKonfiguraciju();

class FetchUpravitelj {
	constructor(tajniKljucJWT) {
		this.auth = new Autentifikacija();
		this.tajniKljucJWT = tajniKljucJWT;
		this.ucitaj();
	}

	async ucitaj() {
		try {
			await konf.ucitajKonfiguraciju();
			this.sp = new SerijePretrazivanje(konf.dajKonf()["tmdb.apikey.v3"]);
			this.restTMDB = new RestTMDB(konf.dajKonf()["tmdb.apikey.v3"]);
		} catch (error) {
			console.error("Error u ucitavanju konfiguracije:", error);
		}
	}

	dajSveZanrove = async function (zahtjev, odgovor) {
		odgovor.json(await this.sp.dohvatiSveZanrove());
	};
	dajDvijeSerije = async function (zahtjev, odgovor) {
		odgovor.json(await this.sp.dohvatiNasumiceSeriju(zahtjev.query.zanr));
	};

	getJWT = async function (zahtjev, odgovor) {
		let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
		if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
			odgovor.status(401).json({opis: 'potrebna prijava'});
		} else {
			konf.ucitajKonfiguraciju().then(() => {
				let valjanost = konf.dajKonf().jwtValjanost;
				if (zahtjev.session.korime != null) {
					let k = { korime: zahtjev.session.korime };
					let noviToken = jwt.kreirajToken(k, this.tajniKljucJWT, valjanost*1000);
					odgovor.json({ ok: noviToken , korime: zahtjev.session.korime });
					return;
				}
				odgovor.status(401).json({ greska: "nemam token!" });
			}).catch((error) => odgovor.status(401).json({greska: error}));
		}
	};

	dohvatiKljuceve = async function (zahtjev, odgovor) {
		konf.ucitajKonfiguraciju().then(async () => {
			let recaptchaTokenIzKonf = konf.dajKonf()["recaptcha.sitekey"];
			console.log("recaptchatokenizkonf: ", recaptchaTokenIzKonf);
			odgovor.status(200).json({recaptchaTokenIzKonf: recaptchaTokenIzKonf});
		}).catch((error) => odgovor.send(400).json({greska: error}))
	}

	kreirajTotp = async function (zahtjev, odgovor) {
		konf.ucitajKonfiguraciju().then(async () => {
			let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
			if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
				odgovor.status(401).json({ opis: "potrebna prijava" });
			} else {
				try {
					const korime = zahtjev.session.korime;
					const tajniKljuc = await totp.kreirajTajniKljuc(korime);
					console.log("tajni kljuc: ", tajniKljuc);
					odgovor.status(200).json({ totpTajniKljuc: tajniKljuc });
				} catch (error) {
				console.error("Error u kreirajTotp:", error);
				odgovor.status(500).json({ error: "server error" });
				}
			}
		})
	};

	vratiTotp = async function(zahtjev, odgovor) {
		let uneseniKod = zahtjev.body.uneseniKod;
		let tajniKljuc = zahtjev.body.tajniKljuc;
		if(uneseniKod == undefined || tajniKljuc == undefined){
			console.log("prazan zahtjev");
			return false;
		} else {
			let rezultat = await totp.provjeriTOTP(uneseniKod, tajniKljuc);
			if(rezultat == true){
				odgovor.status(200).json({opis: 'dobar totp'});
			}else {
				odgovor.status(401).json({greska: 'krivi totp'});
			}
		}
	}

	async provjeriGithubPrijavu(zahtjev, odgovor){
		console.log("zahtjev u provjergithubprijavu: ", zahtjev.session);
		let podaci = await github.provjeriToken(zahtjev.session.githubToken);
		if(podaci.login){
			zahtjev.session.korime = podaci.login;
			odgovor.status(201).json({opis: true});
		} else odgovor.status(401).json({opis: false});
	}

	getStranicenje = async function (zahtjev, odgovor) {
		console.log("zahtjev.session u stranicenje: ", zahtjev.session);
		let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
		if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
			odgovor.status(401).json({opis: 'potrebna prijava'});
		} else {
			odgovor.status(200).json({ stranicenje: this.tajniKljucJWT });
		}
	};

	serijePretrazivanje = async function (zahtjev, odgovor) {
		let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
		console.log("zahtjev serijepretrazivanje: ", zahtjev.session);
		if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
			odgovor.status(401).json({opis: 'potrebna prijava'});
		} else {
			odgovor.json(await this.sp.dohvatiSerije(zahtjev));
		}
	};

	dohvatiDetalji = async function (zahtjev, odgovor) {
		let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
		if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
			odgovor.status(401).json({opis: 'potrebna prijava'});
		} else {
			if(jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
				let token = zahtjev.session.authorization;
				let korime = zahtjev.session.korime;
				odgovor.setHeader('Content-Type', 'application/json');
				odgovor.setHeader('Korime', korime);
				odgovor.setHeader('Authorization', token);
				let podaci = await this.sp.dohvatiDetalje(zahtjev.body.idSerije);
				odgovor.status(201).json(podaci);
			} else {
				let podaci = await this.sp.dohvatiDetalje(zahtjev.body.idSerije);
				odgovor.status(201).json(podaci);
			}
		}
	};

	githubZasticeno = async function(zahtjev, odgovor) {
		let podaci = await github.provjeriToken(zahtjev.session.githubToken);
		odgovor.status(200).json(podaci);
	}

	githubPovratno = async function(zahtjev, odgovor) {
		try {
			let token = await github.dajAccessToken(zahtjev.query.code);
			zahtjev.session.githubToken = token;

			let githubKorisnikPodaci = await github.provjeriToken(token);
			if(githubKorisnikPodaci.login != undefined){
				zahtjev.session.githubKorisnikPodaci = githubKorisnikPodaci;
				zahtjev.session.korime = githubKorisnikPodaci.login;
				konf.ucitajKonfiguraciju().then(() => {
                    const tajniKljuc = konf.dajKonf().jwtTajniKljuc;
                    const jwtValjanost = konf.dajKonf().jwtValjanost;
                    let k = { korime: zahtjev.session.korime };
                    let token = jwt.kreirajToken(k, tajniKljuc, jwtValjanost*1000);
					zahtjev.session.tip_korisnika = 2;
					zahtjev.session.authorization = token;
					console.log("token: ", token);
					odgovor.status(201).redirect("/");
                }).catch((err) => odgovor.status(500).json({greska: err}));
			}else {
				odgovor.status(500).json({greska: 'greska tokom prijave'});
			}
		}catch (error){
			console.error('github povratno error: ', error);
		}
	}

	githubPrijava = async function(zahtjev, odgovor){
		let url = await github.dajGithubAuthURL('http://localhost:12369/githubPovratno');
		console.log("url: ", url);
		odgovor.status(200).json(url);
	}
}
module.exports = FetchUpravitelj;
