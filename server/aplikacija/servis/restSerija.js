const Konfiguracija = require("../konfiguracija.js");
const jwt = require("../moduli/jwt.js");
const SerijaDAO = require("./serijaDAO.js");
const DnevnikDAO = require("./dnevnikDAO.js");
let konf = new Konfiguracija();
let sdao = new SerijaDAO();
let ddao = new DnevnikDAO();

exports.getSerije = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            ddao.dodaj("GET", new Date(), "baza/serije", null, tijelo.korime);
            sdao.dajSve().then((serije) => {
                odgovor.status(200).json(serije);
            })
        }
    }).catch((error) => odgovor.status(401).json({greska: error}));
}

exports.getSerija = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            ddao.dodaj("GET", new Date(), `baza/serije/${zahtjev.params.id}`, null, tijelo.korime);
            let id = zahtjev.params.id;
            sdao.daj(id).then((serija) => {
                odgovor.status(200).json((serija));
            });
        }
    }).catch((err) => {odgovor.status(401).json({greska: err})});
}

exports.getSezone = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            ddao.dodaj("GET", new Date(), "baza/sezona", null, tijelo.korime);
            sdao.dajSveSezone().then((sezone) => {
                odgovor.status(200).json(sezone);
            })
        }
    }).catch((error) => odgovor.status(401).json({greska: error}));
}

exports.getFavoriti = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let korime = zahtjev.session.korime;
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            ddao.dodaj("GET", new Date(), "baza/favoriti", null, tijelo.korime);
            sdao.dajSveFavorite(korime).then((favoriti) => {
                odgovor.status(200).json(favoriti);
            })
        }
    }).catch((error) => odgovor.status(401).json({greska: error}));
}

exports.getFavorit = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let korime = zahtjev.session.korime;
            let id = zahtjev.params.id;
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            ddao.dodaj("GET", new Date(), `baza/favorit/${id}`, null, tijelo.korime);
            sdao.dajFavorit(id, korime).then((favoriti) => {
                odgovor.status(200).json(favoriti);
            })
        }
    }).catch((error) => odgovor.status(401).json({greska: error}));
}

exports.postSerije = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
                let podaci = zahtjev.body;
                let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
                ddao.dodaj("POST", new Date(), "baza/serije", null, tijelo.korime);
                sdao.dodaj(podaci).then((poruka) => {
                    odgovor.status(201).json(JSON.stringify(poruka));
                });
        }
    }).catch((err) => odgovor.status(401).json({greska: err}));
}

exports.postSezone = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
                let podaci = zahtjev.body;
                let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
                ddao.dodaj("POST", new Date(), "baza/sezona", null, tijelo.korime);
                sdao.dodajSezonu(podaci).then((poruka) => {
                    odgovor.status(201).json(JSON.stringify(poruka));
                });
        }
    }).catch((err) => odgovor.status(401).json({greska: err}));
}

exports.postFavoriti = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
                let podaci = zahtjev.body;
                let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
                ddao.dodaj("POST", new Date(), "baza/favoriti", null, tijelo.korime);
                sdao.dodajFavorit(podaci).then((poruka) => {
                    odgovor.status(201).json(JSON.stringify(poruka));
                });
        }
    }).catch((err) => odgovor.status(401).json({greska: err}));
}

exports.deleteFavorit = async function (zahtjev, odgovor) {
    let favoritBrisanje = zahtjev.params.id;
    let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
    if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
        odgovor.status(401).json({ opis: "potrebna prijava" });
    } else {
        let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
        ddao.dodaj("DELETE", new Date(), `baza/favorit/${favoritBrisanje}`, "izvrseno", tijelo.korime);
        await sdao.obrisi(favoritBrisanje).then((poruka) => {
            odgovor.status(201).json({opis: "izvrseno"});
        }).catch((error) => {
            odgovor.status(400).json({greska: "error servera!"});
        });
    }
};

exports.dohvatiSezoneZaFavorita = async function (z, o){
    let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
    if(!jwt.provjeriToken(z, jwtTajniKljuc)) o.status(401).json({opis: "potrebna prijava"})
    else {
        let tijelo = jwt.dajTijelo(z.session.authorization);
        ddao.dodaj("GET", new Date(), `baza/sezona/${z.params.id}`, null, tijelo.korime);
        await sdao.dajSpecSezonu(z.params.id).then((podaci) => {
            o.status(201).json(podaci);
        }).catch((err) => o.status(400).json({greska: err}));
    }
}

exports.zabranjenoPUT = function (zahtjev, odgovor) {
    let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
    if(!jwt.provjeriToken(z, jwtTajniKljuc)) o.status(401).json({opis: "potrebna prijava"})
    else {
        let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
        ddao.dodaj("PUT", new Date(), `baza/sezona/${zahtjev.params.id}`, null, tijelo.korime);
        odgovor.status(405).json({opis: "zabranjeno"});
    }
}

exports.zabranjenoPOST = function (zahtjev, odgovor) {
    let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
    if(!jwt.provjeriToken(z, jwtTajniKljuc)) o.status(401).json({opis: "potrebna prijava"})
    else {
        let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
        ddao.dodaj("POST", new Date(), `baza/sezona/${zahtjev.params.id}`, null, tijelo.korime);
        odgovor.status(405).json({opis: "zabranjeno"});
    }
}

exports.nijeImplementirano = function (zahtjev, odgovor) {
    odgovor.status(501).json({opis: "metoda nije implementirana"});
}