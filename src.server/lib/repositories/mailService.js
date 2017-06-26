const debug = require('debug')('repo:mailService');
const fs = require('fs');
const { join } = require('path');
const nodemailer = require('nodemailer');


module.exports = ({ emailConfig, nodemailerTransport }) =>
/*
  Usage:

  container.resolve('mailService').sendMail({
    senderName: 'Flemming',
    recieverEmail: 'gnimmelf@gmail.com',
    subjectStr: 'mailService Test',
    textOrHtml: 'TEST BODY'
  });
*/
{

  // create reusable transporter object using SMTP transport
  var transporter = nodemailer.createTransport(nodemailerTransport);


  const sendMail = ({ senderName, recieverEmail, subjectStr, textOrHtml }) => {

    // Setup e-mail data with unicode symbols
    var mail_options = {
      from: senderName + ' <'+ emailConfig.senderEmail +'>',
      to: recieverEmail,
      subject: subjectStr,
    };

    mail_options[textOrHtml.startsWith('<') ? 'html' : 'text'] = textOrHtml;

    debug('mail_options', mail_options)

    // Send mail with defined transport object
    transporter.sendMail(mail_options, function(err, info){
      debug('mail sendt!', err || info)
      if (err) throw err;
    });

  };

  return {
    sendMail: sendMail
  }

}

