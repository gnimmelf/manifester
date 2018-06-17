const debug = require('debug')('mf:repo:nodemailerTransport');
const assert = require('assert');
const mailgunTransport = require('nodemailer-mailgun-transport');

const {
  loggers
} = require('../../utils');


module.exports = ({ emailConfig }) =>
{
  const logger = loggers.get('default');

  logger.warn('No custom `nodemailerTransport` found. -Setting up default (mailgun)');
  assert(emailConfig && emailConfig.mailgunAuth, 'Could not set up mailService. `emailConfig.mailgunAuth` not found!')

  const { api_key, domain } = emailConfig.mailgunAuth;

  return mailgunTransport({
    auth: {
      api_key: api_key,
      domain: domain,
    }
  })
}