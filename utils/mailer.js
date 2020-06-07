const nodemailer = require('nodemailer');

module.exports = function mail(to,subject,body="",HTMLbody="") {

    const transporter = nodemailer.createTransport({
        host: "hosting.logictrixinfotech.com",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: "kirtan@kpsolutions.live",
            pass: "kirtan@007"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'Kirtan<kirtan@kpsolutions.live>',
        to: to,
        subject: subject,
        text: body,
        html: HTMLbody
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
