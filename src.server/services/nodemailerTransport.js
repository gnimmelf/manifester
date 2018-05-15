const debug = require('debug')('mf:repo:nodemailerTransport');
const assert = require('assert');
const mailgunTransport = require('nodemailer-mailgun-transport');

module.exports = ({ emailConfig }) =>
{
  debug('No custom `nodemailerTransport` found. -Setting up default (mailgun)');
  assert(emailConfig && emailConfig.mailgunAuth, 'Could not set up mailService. `emailConfig.mailgunAuth` not found!')

  return mailgunTransport({
    auth: {
      api_key: emailConfig.mailgunAuth.api_key,
      domain: emailConfig.mailgunAuth.domain,
    }
  })
}