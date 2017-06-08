var fs = require('fs');
var path = require('path');

var nodemailer = require('nodemailer');
var mgt = require('nodemailer-mailgun-transport'); // http://github.com/orliesaurus/nodemailer-mailgun-transport

var credentials = require('upquire')('/sensitive/credentials/mailgun');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(mgt({
    auth: {
        api_key: credentials.apiKey,
        domain: credentials.domain,
    }
}));

module.exports = function({sender_name, reciever_email, subject_str, text_or_html}) {

  // setup e-mail data with unicode symbols
  var mail_options = {
    from: sender_name + ' <'+ credentials.senderEmail +'>',
    to: reciever_email,
    subject: subject_str,
  };

  mail_options[text_or_html.startsWith('<') ? 'html' : 'text'] = text_or_html;

  // send mail with defined transport object
  transporter.sendMail(mail_options, function(error, info){
    if(error) {
      console.log(error);
      console.log('Fail email details:')
      console.log(mailOptions)
    }
    else {
      console.log('Message sent: ' + info.response);
    }
  });

}