const Konfiguracija = require('../konfiguracija');
const konf = new Konfiguracija();
konf.ucitajKonfiguraciju();

//let githubClientID = 'efb0aef89344a2175f41';
//let githubTajniKljuc = '4a6289a0dd7c0de6956fef192a0aca0b4da6cdfc';

exports.dajGithubAuthURL = function(povratniURL){
	const clientIzKonf = konf.dajKonf()["github.clientid"];
	const secretIzKonf = konf.dajKonf()["github.TajniKljuc"];
	console.log("cizk1: ", clientIzKonf, " , sizk1: ", secretIzKonf);
	let url = "https://github.com/login/oauth/authorize?client_id="+
	clientIzKonf+"&redirect_uri="+povratniURL;
	return url;
}

exports.dajAccessToken = async function(dobiveniKod){
	const clientIzKonf = konf.dajKonf()["github.clientid"];
	const secretIzKonf = konf.dajKonf()["github.TajniKljuc"];
	console.log("cizk2: ", clientIzKonf, " , sizk2: ", secretIzKonf);
	let parametri = {
		method: 'POST',
		headers: { Accept: "application/json" },
	};
	let urlParametri = "?client_id="+clientIzKonf+
	"&client_secret="+secretIzKonf+"&code="+dobiveniKod;
	let o = await fetch("https://github.com/login/oauth/access_token"+urlParametri, parametri);
	//let o = await fetch("https://github.com/login/oauth/access_token", parametri);
	let podaci = await o.text();
	console.log("podaci git: ", podaci);
	return JSON.parse(podaci).access_token;
}

exports.provjeriToken = async function(token){
	let parametri = {
		method: 'GET',
		headers: { Authorization: "Bearer "+token }
	};
	let o = await fetch("https://api.github.com/user",parametri);
	let podaci = await o.json();
	console.log("podaci iz provjeriToken: ", podaci);
	return podaci;
}