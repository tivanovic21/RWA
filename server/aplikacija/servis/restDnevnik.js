const Konfiguracija = require("../konfiguracija.js");
const DnevnikDAO = require("./dnevnikDAO.js");
const jwt = require("../moduli/jwt.js");
const kodovi = require("../moduli/kodovi.js");
let konf = new Konfiguracija();
let ddao = new DnevnikDAO();

exports.getDnevnik = function (zahtjev, odgovor) {
    konf.ucitajKonfiguraciju().then(() => {
        let jwtTajniKljuc = konf.dajKonf().jwtTajniKljuc;
        if (!jwt.provjeriToken(zahtjev, jwtTajniKljuc)) {
            odgovor.status(401).json({ opis: "potrebna prijava" });
        } else {
            let tijelo = jwt.dajTijelo(zahtjev.session.authorization);
            if(zahtjev.session.tip_korisnika == 1){
                ddao.dajSve().then((korisnici) => {
                    odgovor.status(200).json(korisnici);
                });
            } else {
                odgovor.status(401).json({greska: "neautoriziran pristup"});
            }
        }
    }).catch((error) => odgovor.status(401).json({greska: error}));
}