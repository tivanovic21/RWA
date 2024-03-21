import express from "express";
import kolacici from "cookie-parser";
import sesija from "express-session";
import Konfiguracija from "./konfiguracija.js";
import cors from "cors";
//import portovi from "/var/www/RWA/2023/portovi.js";
import restKorisnik from "./servis/restKorisnik.js";
import restDnevnik from "./servis/restDnevnik.js";
import restSerija from "./servis/restSerija.js"
import HtmlUpravitelj from "./htmlUpravitelj.js";
import FetchUpravitelj from "./fetchUpravitelj.js";

import path from 'path';
//const port = portovi.tivanovic21;
const port = 12369;
console.log("ovo je port: ", port);
const server = express();

let konf = new Konfiguracija();
konf
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska) => {
		if (process.argv.length == 2) {
			console.error("Molim unesite naziv datoteke!");
		} else {
			console.error("Greska prilikom pokretanja: " + greska);
		}
	});

function pokreniServer() {
    server.use(cors({
        origin: 'http://localhost:4200',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }));
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());

	server.use(kolacici());
	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: true,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);

	server.use("/dokumentacija", express.static("../dokumentacija"));
	server.use("/css", express.static("./css"));

	server.use((zahtjev, odgovor, next) => {
		if (zahtjev.url.startsWith('/github')) {
			odgovor.header('Access-Control-Allow-Origin', 'http://localhost:4200');
			odgovor.header('Access-Control-Allow-Methods', 'GET, POST');
			odgovor.header('Access-Control-Allow-Headers', 'Content-Type');
		}
		next();
	});

	pripremiPutanjeSerije();
	pripremiPutanjeKorisnik();
	pripremiPutanjeWebAplikacije();
	pripremiPutanjeAutentifikacija();
	pripremiPutanjePretrazivanjeSerija();
	pripremiPutanjeGithub();

	server.use(express.static(path.resolve('../angular')));
	const angularRoutes = ['/pocetna', '/prijava', '/registracija', '/favoriti', '/favoritiDetalji', '/korisnici', '/dnevnik', '/profil'];

	server.get('*', (req, res) => {
	  const angularRouteMatch = angularRoutes.some(route => req.url.startsWith(route));
	  if (angularRouteMatch) {
		res.sendFile(path.resolve('../angular/index.html'));
	  } else {
		res.status(404).json({ opis: 'Nema resursa' });
	  }
	});

	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		odgovor.json({ opis: "nema resursa" });
	});
	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});
}
function pripremiPutanjeSerije(){
	server.get("/baza/serije", restSerija.getSerije);
	server.post("/baza/serije", restSerija.postSerije);
	server.get("/baza/sezona", restSerija.getSezone);
	server.post("/baza/sezona", restSerija.postSezone);

	server.get("/baza/favoriti", restSerija.getFavoriti);
	server.post("/baza/favoriti", restSerija.postFavoriti);
	server.put("/baza/favoriti", restSerija.nijeImplementirano);
	server.delete("/baza/favoriti", restSerija.nijeImplementirano);

	server.get("/baza/serije/:id", restSerija.getSerija);
	server.get("/baza/sezona/:id", restSerija.dohvatiSezoneZaFavorita);
	server.get("/baza/favoriti/:id", restSerija.getFavorit);
	server.post("/baza/favoriti/:id", restSerija.zabranjenoPOST);
	server.put("/baza/favoriti/:id", restSerija.zabranjenoPUT);
	server.delete("/baza/favoriti/:id", restSerija.deleteFavorit);
}

function pripremiPutanjeKorisnik() {
	server.get("/baza/korisnici", restKorisnik.getKorisnici);
	server.post("/baza/korisnici", restKorisnik.postKorisnici);
	server.put("/baza/korisnici", restKorisnik.putKorisnici);
	server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);

	server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
	server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
	server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);
	server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);

	server.get("/baza/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava);
	server.post("/baza/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava);

	server.get("/baza/dnevnik", restDnevnik.getDnevnik);
}

function pripremiPutanjePocetna() {
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.get("/", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
	server.get("/dajSveZanrove", fetchUpravitelj.dajSveZanrove.bind(fetchUpravitelj));
	server.get("/dajDvijeSerije", fetchUpravitelj.dajDvijeSerije.bind(fetchUpravitelj));
}

function pripremiPutanjeWebAplikacije() {
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.get("/dokumentacija", htmlUpravitelj.dokumentacija.bind(htmlUpravitelj));
}

function pripremiPutanjePretrazivanjeSerija() {
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let konfAppf = new FetchUpravitelj(konf.dajKonf().appStranicenje);

	server.post("/",fetchUpravitelj.serijePretrazivanje.bind(fetchUpravitelj));
	server.get("/stranicenje", fetchUpravitelj.getStranicenje.bind(konfAppf));
	server.post("/serijaDetalji", fetchUpravitelj.dohvatiDetalji.bind(fetchUpravitelj));
}

function pripremiPutanjeAutentifikacija() {
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.post("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
	server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
	server.post("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
	server.get("/getJWT", fetchUpravitelj.getJWT.bind(fetchUpravitelj));
	server.get('/kreirajTotp', fetchUpravitelj.kreirajTotp.bind(fetchUpravitelj));
	server.post('/vratiTotp', fetchUpravitelj.vratiTotp.bind(fetchUpravitelj));
	server.get('/dohvatiKljuceve', fetchUpravitelj.dohvatiKljuceve.bind(fetchUpravitelj));
}

function pripremiPutanjeGithub() {
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.get("/githubZasticeno", fetchUpravitelj.githubZasticeno.bind(fetchUpravitelj));
	server.get("/githubPovratno", fetchUpravitelj.githubPovratno.bind(fetchUpravitelj));
	server.get("/githubPrijava", fetchUpravitelj.githubPrijava.bind(fetchUpravitelj));
	server.get("/provjeriGithubPrijavu", fetchUpravitelj.provjeriGithubPrijavu.bind(fetchUpravitelj));
}