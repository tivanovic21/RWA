const KorisnikDAO = require("./korisnikDAO.js");
const Konfiguracija = require("../konfiguracija.js");
const DnevnikDAO = require("./dnevnikDAO.js");
const Autentifikacija = require("../autentifikacija.js");
const jwt = require("../moduli/jwt.js");
const kodovi = require("../moduli/kodovi.js");
let konf = new Konfiguracija();
let kdao = new KorisnikDAO();
let ddao = new DnevnikDAO();
let auth = new Autentifikacija();

exports.getKorisnici = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            if(zahtjev.session.tip_korisnika == 1){
                ddao.dodaj("GET", new Date(), "baza/korisnici", null, tijelo.korime);
                kdao.dajSve().then((korisnici) => {
                    odgovor.status(200).json(korisnici);
                });
            } else {
                ddao.dodaj("GET", new Date(), "baza/korisnici", "zabranjen pristup", tijelo.korime);
                odgovor.status(401).json({greska: "neautoriziran pristup"});
            }
        }
    }).catch((error) => odgovor.status(401).json({greska: error}));
}

exports.postKorisnici = function (zahtjev, odgovor) {
    const token = zahtjev.headers['authorization'];
    zahtjev.session.authorization = token;
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(token);
            const tip_korisnika_id = zahtjev.headers['tip_korisnika'];
            if(tip_korisnika_id == 1){
                let podaci = zahtjev.body;
                ddao.dodaj("POST", new Date(), "baza/korisnici", null, tijelo.korime);
                kdao.dodaj(podaci).then((poruka) => {
                    odgovor.status(201).json(JSON.stringify(poruka));
                });
            } else {
                ddao.dodaj("POST", new Date(), "baza/korisnici", "zabranjen pristup", tijelo.korime);
                odgovor.status(401).json("neautorizirani pristup");
            }
        }
    }).catch((err) => odgovor.status(401).json({greska: err}));
}

exports.deleteKorisnici = function (zahtjev, odgovor) {
    odgovor.status(501).json({opis: "metoda nije implementirana"});
}

exports.putKorisnici = function (zahtjev, odgovor) {
    odgovor.status(501).json({opis: "metoda nije implementirana"});
}

exports.getKorisnik = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            let korime = zahtjev.session.korime;
            ddao.dodaj("GET", new Date(), `baza/korisnici/${korime}`, null, tijelo.korime);
            kdao.daj(korime).then((korisnik) => {
                odgovor.status(200).json((korisnik));
                console.log("getkorisnik korisnik: ", korisnik);
            });
        }
    }).catch((err) => {odgovor.status(401).json({greska: err})});
}
exports.getKorisnikPrijava = function (zahtjev, odgovor) {
    const konfig = new Konfiguracija();
    if(zahtjev.method == 'POST'){
        let korime = zahtjev.params.korime;
        kdao.daj(korime).then((korisnik) => {
            if(korisnik!=null && korisnik.lozinka==zahtjev.body.lozinka){
                konfig.ucitajKonfiguraciju().then(() => {
                    const tajniKljuc = konfig.dajKonf().jwtTajniKljuc;
                    const jwtValjanost = konfig.dajKonf().jwtValjanost;
                    let k = { korime: korime };
                    let token = jwt.kreirajToken(k, tajniKljuc, jwtValjanost*1000);
                    let obj = Object.assign(korisnik, {token : `${token}`});
                    console.log("obj: ", obj);
                    odgovor.status(201).send(JSON.stringify(obj));
                }).catch((err) => odgovor.status(500).json({greska: err}));
            }
            else{
                odgovor.status(401).json({greska: "Krivi podaci!"});
            }
        }).catch((err) => odgovor.status(401).json({greska: err}));
    } else if(zahtjev.method == 'GET'){
        if(zahtjev.session.korime != null){
            konfig.ucitajKonfiguraciju().then(() => {
                const tajniKljuc = konfig.dajKonf().jwtTajniKljuc;
                const jwtValjanost = konfig.dajKonf().jwtValjanost;
                let k = { korime: zahtjev.session.korime };
                let token = jwt.kreirajToken(k, tajniKljuc, jwtValjanost*1000);
                odgovor.set('Authorization', `Bearer ${token}`);
                odgovor.header('Authorization', 'Bearer ' + token);
                odgovor.status(201).json({opis: "uspješno dodan token"});
            }).catch((err) => odgovor.status(500).json(({greska: err})));
        } else odgovor.status(401).json({greska: "zabranjen pristup"});
    } else {
        odgovor.status(404).json({opis: "nema resursa"});
    }
}
exports.postKorisnik = function (zahtjev, odgovor) {
    let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
    if(!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
        odgovor.status(401).json({opis: "potrebna prijava"});
    } else {
        let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
        ddao.dodaj("POST", new Date(), `baza/korisnici/${zahtjev.session.korime}`, "zabranjen pristup", tijelo.korime);
        odgovor.status(405).json({greska: "zabranjeno"});
    }
}

exports.deleteKorisnik = async function (zahtjev, odgovor) {
    let korimeBrisanje = zahtjev.params.korime;
    await konf.ucitajKonfiguraciju();
    let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
    if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
        odgovor.status(401).json({ opis: "potrebna prijava" });
    } else {
        let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
        if(zahtjev.session.tip_korisnika == 1){
            let korisnikBrisanje = await kdao.daj(korimeBrisanje);
            if(korisnikBrisanje.tip_korisnika_id != 1){
                ddao.dodaj("DELETE", new Date(), `baza/korisnici/${korimeBrisanje}`, "izvrseno", tijelo.korime);
                await kdao.obrisi(korimeBrisanje).then((poruka) => {
                    odgovor.status(201).json({opis: "izvrseno"});
                }).catch((error) => {
                    console.log("error ", error);
                    odgovor.status(400).json({greska: "error servera!"});
                });
            } else {
                odgovor.status(403).json({opis: "zabranjen pristup"});
            }
        } else {
            ddao.dodaj("DELETE", new Date(), `baza/korisnici/${korimeBrisanje}`, "zabranjen pristup", tijelo.korime);
            odgovor.status(403).json({opis: "zabranjen pristup"});
        }
    }
};

exports.putKorisnik = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) odgovor.status(401).json({ opis: "potrebna prijava" });
        else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            let korime = zahtjev.params.korime;
            let podaci = zahtjev.body;
            let hashiraj = zahtjev.headers['hashiraj'];
            if(hashiraj == "true" && podaci.lozinka != ""){
                podaci.lozinka = kodovi.kreirajSHA256(podaci.lozinka, "moja sol");
            }
            auth.provjeriRecaptchu(zahtjev.body.recaptchaToken).then(async (recaptchaProsla) => {
                if(recaptchaProsla){
                    console.log("recaptcha je prosla!");
                    console.log("podaci u azuriraj: ", podaci);
                    ddao.dodaj("PUT", new Date(), `baza/korisnici/${korime}`, "izvrseno", tijelo.korime);
                    kdao.azuriraj(korime, podaci).then(() => {
                        odgovor.status(201).json({opis: "izvrseno"});
                    }).catch((err) => odgovor.status(401).json({greska: err}));
                } else {
                    console.log("recaptcha nije prosla!");
                    odgovor.status(400).json({greska: 'recaptcha nije prosla'});
                }
            })
        }
    }).catch((err) => odgovor.status(401).json({greska: err}));
};