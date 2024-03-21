const nodemailer = require('nodemailer');

let mailer = nodemailer.createTransport({
    host: 'mail.foi.hr',
    port: 25,
//   		auth: {
//		user: "",
//        pass: ""
//    }
});


exports.posaljiMail = async function(salje, prima, predmet, poruka){
	message = {
		from: salje,
		to: prima,
		subject: predmet,
		text: poruka
	}

	console.log("poruka za slanje: ", message);
	try {
		let odgovor = await mailer.sendMail(message);
		console.log(odgovor);
		return odgovor;
	} catch (error){
		console.error(error);
		throw error;
	}
};

mailer.verify(function (error, success) {
    if (error) {
		// ne radi kad se lokalno testira!
        //console.log("error nodemailer: ", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});