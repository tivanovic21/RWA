const ds = require("fs/promises");
const Autentifikacija = require("./autentifikacija.js");
const Baza = require("./servis/baza.js");
const kodovi = require("./moduli/kodovi.js");

const Konfiguracija = require("./konfiguracija.js");
const jwt = require("./moduli/jwt.js");
const konf = new Konfiguracija();
const github = require("./moduli/github.js");
konf.ucitajKonfiguraciju();

class HtmlUpravitelj {
	constructor(tajniKljucJWT) {
		this.tajniKljucJWT = tajniKljucJWT;
		//console.log(this.tajniKljucJWT);
		this.auth = new Autentifikacija();
		this.baza = new Baza("../RWA2023tivanovic21.sqlite");
	}

	async pocetna(zahtjev, odgovor) {
		let pocetna = await ucitajStranicu("pocetna");
		odgovor.send(pocetna);
	};

	async dokumentacija(zahtjev, odgovor) {
		let dokumentacija = await ucitajStranicu("dokumentacija");
		odgovor.send(dokumentacija);
	};
	async korisnici(zahtjev, odgovor) {
		let korisnici = await ucitajStranicu("korisnici");
		odgovor.send(korisnici);
	};
	async profil(zahtjev, odgovor) {
		let profil = await ucitajStranicu("profil");
		odgovor.send(profil);
	};

	async dnevnik(zahtjev, odgovor){
		let dnevnik = await ucitajStranicu("dnevnik");
		odgovor.send(dnevnik);
	}

	registracija = async function (zahtjev, odgovor) {
		let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
		if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
			odgovor.status(401).json({opis: 'potrebna prijava'})
		} else {
			if(zahtjev.session.tip_korisnika == 1){
				let greska = "";
				if (zahtjev.method == "POST") {
					let uspjeh = await this.auth.dodajKorisnika(zahtjev);
					console.log("uspjeh: ", uspjeh);
					if (uspjeh) {
						odgovor.status(201).json(uspjeh);
						//odgovor.redirect("/prijava");
						//return;
					} else {
						greska = "Dodavanje nije uspjelo provjerite podatke!";
					}
			}
				//let stranica = await ucitajStranicu("registracija", greska);
				//odgovor.send(stranica);
			} else {
				odgovor.status(401).json({greska: "samo admin može pristupiti!"});
				console.log("registraciju može napraviti samo admin!");
			}
		}
	};

	odjava = async function (zahtjev, odgovor) {
		let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
		if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)){
			odgovor.status(401).json({opis: 'potrebna prijava'});
		}else {
			zahtjev.session.destroy(function(err) {
				if (err) {
					console.error(err);
				} else {
					odgovor.redirect("/");
				}
			});
		}
	};

	prijava = async function (zahtjev, odgovor) {
		console.log("doslo do prijava!");
		console.log("zahtjev u prijava: ", zahtjev);
		console.log("zahtjev.body u prijava: ", zahtjev.body);
		let greska = "";
		if (zahtjev.method == "POST") {
			var korime = zahtjev.body.korime;
			var lozinka = zahtjev.body.lozinka;
			var saltedLozinka = kodovi.kreirajSHA256(lozinka, "moja sol");
			console.log("korime: ", korime, "lozinka: ", lozinka, "saltedLozinka: ", saltedLozinka);
			try {
				this.baza.spojiSeNaBazu();
				let upit = 'SELECT tip_korisnika_id FROM "korisnik" WHERE "korime" = ? AND lozinka = ?';
				let rezultat =  await this.baza.izvrsiUpit(upit, [korime, saltedLozinka]);
				console.log("rezultati: ", rezultat);
				if(rezultat.length > 0){
					var korisnik = await this.auth.prijaviKorisnika(zahtjev, korime, lozinka);
					if (korisnik) {
						korisnik = JSON.parse(korisnik);
						if(korisnik.hoce2fa){
							console.log("zahtjev.body za totp: ", zahtjev.body);
							if(zahtjev.body.totp != undefined){
								let bool = await this.auth.provjeriTotp(zahtjev.body.totp, korisnik.totp);
								console.log("bool vrijednost: ", bool);
								if(bool){
									zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
									zahtjev.session.korime = korisnik.korime;
									zahtjev.session.tip_korisnika = korisnik.tip_korisnika_id;
									zahtjev.session.authorization = korisnik.token;
									odgovor.status(201).json({message: 'uspješna prijava', user: korisnik});
								} else {
									odgovor.status(401).json({message: 'krivi totp'});
								}
								return;
							} else {
								odgovor.status(401).json({message: 'totp'});
							}
						} else {
							zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
							zahtjev.session.korime = korisnik.korime;
							zahtjev.session.tip_korisnika = korisnik.tip_korisnika_id;
							zahtjev.session.authorization = korisnik.token;
							odgovor.status(201).json({message: 'uspješna prijava', user: korisnik});
						}
						return;
					} else {
						greska = "Netocni podaci!";
					}
				} else {
					greska = "Korisnik nije pronaden!";
				}

			} catch (error) {
				console.log(error);
				greska = "Database error";
			} finally {
				this.baza.zatvoriVezu();
			}
		}

		let stranica = await ucitajStranicu("prijava", greska);
		odgovor.send(stranica);
	};

	serijePretrazivanje = async function (zahtjev, odgovor) {
		let stranica = await ucitajStranicu("serije_pretrazivanje");
		odgovor.send(stranica);
	};
	serijaDetalji = async function (zahtjev, odgovor) {
		let stranica = await ucitajStranicu("serijaDetalji");
		odgovor.send(stranica);
	};
	favoriti = async function (zahtjev, odgovor) {
		let stranica = await ucitajStranicu("favoriti");
		odgovor.send(stranica);
	};
	favoritiDetalji = async function (zahtjev, odgovor) {
		let stranica = await ucitajStranicu("favoritiDetalji");
		odgovor.send(stranica);
	};
}

module.exports = HtmlUpravitelj;

async function ucitajStranicu(nazivStranice, poruka = "") {
	if(nazivStranice != "dokumentacija"){
		let stranice = [ucitajHTML(nazivStranice), ucitajHTML("navigacija")];
		let [stranica, nav] = await Promise.all(stranice);
		stranica = stranica.replace("#navigacija#", nav);
		stranica = stranica.replace("#poruka#", poruka);
		return stranica;
	} else {
		let straniceDokumentacije = [ucitajDokumentaciju(nazivStranice), ucitajHTML("navigacija")];
		let [stranica, nav] = await Promise.all(straniceDokumentacije);
		stranica = stranica.replace("#navigacija#", nav);
		return stranica;
	}
}

function ucitajHTML(htmlStranica) {
	return ds.readFile(__dirname + "/html/" + htmlStranica + ".html", "UTF-8");
}

function ucitajDokumentaciju(htmlStranica) {
	const dokumentacijaPath = __dirname + "/../dokumentacija/" + htmlStranica + ".html";
    return ds.readFile(dokumentacijaPath, 'UTF-8');
}