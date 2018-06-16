const debug = require('debug')('mf:api:inspect');

const expressListEndpoints = require('express-list-endpoints');

const Table = require('cli-table')

const {
  sendApiResponse,
  requestFullUrl
} = require('../utils');

module.exports = ({ mainApp }) =>
{
  const endpoints = {
    asObj:  expressListEndpoints(mainApp)
  };

  const table = new Table({
    head: ['Method', 'url'],
  });

  table.push(...endpoints.asObj.map(r => ([r.methods[0], r.path])));

  endpoints.asText = table.toString();
  endpoints.asHtml = ['<pre>', table.toString().replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ''), '</pre>'].join('\n');

  return {

    getEndpoints: (req, res) => sendApiResponse(res, endpoints.asObj),
    getEndpointsAsHtml: (req, res) => res.send(endpoints.asHtml),
    getEndpointsAsText: (req, res) => res.send(endpoints.asText),

  };
};