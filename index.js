/**
 * Export the Manifester "api".
 */
const http = require('http');
const { join, dirname, resolve } = require('path');
const assert = require('assert');
const caller = require('caller');
const app = require('./src.server/app');
const { inspect } = require('./src.server/lib');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.set('env', process.env.ENV || 'development');

assert(~['production', 'development'].indexOf(app.get('env')),
    "'ENV' must be 'production' or 'development' when specified! -Defaults to 'development'");


// Server
let server;

/**
 * Get port from environment and store in Express.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('\nListening on ' + bind);
}

/**
 * Export stuff needed to create client code.
 */

module.exports = Object.assign({}, app.localApp, {
  mainApp: app,
  run: ({ localAppPath = dirname(caller()) } = {}) =>  {

    assert(localAppPath, 'required!')

    localAppPath = resolve(localAppPath);

    console.log('\nlocalPath', localAppPath);
    console.log('ENV', app.get('env'));

    const sensitive = require(join(localAppPath, 'sensitive.json'));

    app.get('container').registerValue({
      localAppPath: localAppPath,
      hashSecret: sensitive.hashSecret,
      emailConfig: sensitive.emailConfig,
    });

    // inspect(app.get('container').registrations)

    server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  },
})

