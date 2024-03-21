const mail = require("./moduli/mail.js");
const kodovi = require("./moduli/kodovi.js");
const portRest = 12369;
const totp = require("./moduli/totp.js");
const Konfiguracija = require("./konfiguracija.js");
const jwt = require("./moduli/jwt.js");
let konf = new Konfiguracija();

class Autentifikacija {

	async provjeriRecaptchu(recaptchaToken){
		console.log('recaptchaToken: ', recaptchaToken);
		await konf.ucitajKonfiguraciju();
		let secretIzKonf = konf.dajKonf()["recaptcha.secretkey"];
		//let secretkey = '6Ler90QpAAAAAOr52mupustriYoj1R4gnd6Yo0OF';
		//console.log("secretkey: ", secretkey);
		let parametri = {method: 'POST'}
		let o = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretIzKonf}&response=${recaptchaToken}`, parametri);
		let recaptchaStatus = JSON.parse(await o.text());
		console.log("recaptchaStatus: ", recaptchaStatus);
		if(recaptchaStatus.success && recaptchaStatus.score > 0.5) return true;
		else return false;
	}

	async provjeriTotp(uneseniKod, tajniKljuc){
		console.log("unesenikod: ", uneseniKod, " tajnikljuc: ", tajniKljuc);
		let parametri = {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			},
			body: JSON.stringify({ uneseniKod: uneseniKod, tajniKljuc: tajniKljuc }),
		};
		console.log("parametri: ", parametri);
		let odgovor = await fetch(`http://localhost:12369/vratiTotp`, parametri);
		console.log("odgovor.status: ", odgovor.status);
		if(odgovor.status == 200){
			return true;
		} else {
			return false;
		}
	}

	async dodajKorisnika(zahtjev) {
		console.log("zahtjev.recaptchatoken: ", zahtjev.body.recaptchaToken);
		let provjeraRecaptche = await this.provjeriRecaptchu(zahtjev.body.recaptchaToken);
		if(provjeraRecaptche == true){
			let korisnik = zahtjev.body;
			if(korisnik.lozinka != null && korisnik.email != null && korisnik.korime != null){
				let tijelo = {
					ime: korisnik.ime,
					prezime: korisnik.prezime,
					korime: korisnik.korime,
					email: korisnik.email,
					lozinka: kodovi.kreirajSHA256(korisnik.lozinka, "moja sol"),
					adresa: korisnik.adresa,
					postanskiBroj: korisnik.postanskiBroj,
					brojMobitela: korisnik.brojMobitela,
					tip_korisnika_id: 2
				};
				console.log("sesija prije zaglavlja: ", zahtjev.session);
				let zaglavlje = new Headers();
				zaglavlje.set("Content-Type", "application/json");
				if (zahtjev.session) {
					zaglavlje.set("tip_korisnika", zahtjev.session.tip_korisnika);
					zaglavlje.set("authorization", zahtjev.session.authorization)
				}
				console.log("auth header brate: ", zaglavlje.get("authorization"));
				let parametri = {
					method: "POST",
					body: JSON.stringify(tijelo),
					headers: zaglavlje,
				};
				console.log("auth headers: ", zaglavlje);
				let odgovor = await fetch(
					"http://localhost:" + portRest + "/baza/korisnici",
					parametri
				);
				console.log("odgovor status: ", odgovor.status);
				if (odgovor.status == 201) {
					console.log("Korisnik ubačen na servisu");
					let mailPoruka = "Uspješna registracija! Vaše korisnicko ime je: " +
						korisnik.korime + " ,a vaša lozinka je: " + korisnik.lozinka;
					let predmet = 'Uspješna registracija!';
					console.log("mailPoruka: ", mailPoruka);
					/*let poruka = await mail.posaljiMail(
						"tivanovic21@student.foi.hr",
						korisnik.email,
						predmet,
						mailPoruka
					);
					console.log("poruka u auth: ", poruka);*/ //ovo je zakomentirano jer mail ne radi ako nije na spideru!
					return true;
					} else {
						console.log(odgovor.status);
						console.log(await odgovor.text());
						return false;
					}
			} else {
				console.log("unesi korime, email i lozinku!");
			}
		} else {
			console.log("provjera recaptche nije uspjela!")
			return false;
		}
	}

	async prijaviKorisnika(zahtjev, korime, lozinka) {
		console.log("zahtjev.body: ", zahtjev.body);
		console.log("zahtjev.recaptchatoken: ", zahtjev.body.recaptchaToken);
		let provjeraRecaptche = await this.provjeriRecaptchu(zahtjev.body.recaptchaToken);
		if(provjeraRecaptche == true){
			console.log("Podaci: " + korime + lozinka);
			lozinka = kodovi.kreirajSHA256(lozinka, "moja sol");
			let tijelo = {
				lozinka: lozinka,
			};
			let zaglavlje = new Headers();
			zaglavlje.set("Content-Type", "application/json");

			let parametri = {
				method: "POST",
				body: JSON.stringify(tijelo),
				headers: zaglavlje,
			};
			let odgovor = await fetch(
				"http://localhost:" + portRest + "/baza/korisnici/" + korime + "/prijava",
				parametri
			);
			if (odgovor.status == 201) {
				let odgovorTeskt = await odgovor.text();
				console.log("odgovortekst: ", odgovorTeskt);
				return odgovorTeskt;
				//return await odgovor.text();
			} else {
				return false;
			}
		} else {
			console.log("provjera recaptche nije uspjela!");
			return false;
		}
	}
}

module.exports = Autentifikacija;
