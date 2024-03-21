//const totp = require("/Users/toniivanovic/.nvm/versions/node/v21.1.0/lib/node_modules/totp-generator")
const totp = require("totp-generator");
const kodovi = require("./kodovi.js");
//const base32  = require('/Users/toniivanovic/.nvm/versions/node/v21.1.0/lib/node_modules/base32-encoding')
const base32  = require('base32-encoding');

exports.kreirajTajniKljuc = function(korime){
	let tekst = korime + new Date() + kodovi.dajNasumceBroj(10000000,90000000);
	let hash = kodovi.kreirajSHA256(tekst);
	let tajniKljuc = base32.stringify(hash,"ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
	console.log("tajni kljuc: ");
	console.log(tajniKljuc.toUpperCase());
	return tajniKljuc.toUpperCase();
}

exports.provjeriTOTP = function(uneseniKod,tajniKljuc){
	console.log("uso u provjeritotp!");
	const kod = totp(tajniKljuc, {
		digits: 6,
		algorithm: "SHA-512",
		period: 60
	});
	console.log("kod: ", kod);
	console.log("unesenikod: ", uneseniKod, " ,kod: ", kod)
	if(uneseniKod == kod)
		return true;

    return false;
}
