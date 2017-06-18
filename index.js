/**
 * Export the Manifester "api".
 */
const http = require('http');
const path = require('path');

const src = (rel_path) => path.join(__dirname, 'src.server', rel_path)

const jsonTree = require(src('/lib/json-tree'));
const app = require(src('/app'));

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
 * Start listening.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

let server;

module.exports = {
  _app: app,
  run: () =>  {
    server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  },
  app: app.customApp,
  use: app.customApp.use.bind(app.customApp),
  db: {
    system: jsonTree(path.join(__dirname, '/system')),
    content: jsonTree(path.join(__dirname, '/sensitive/db')),
  },
  middleware: {
    authorize: require(src('/lib/middleware/authorize')),
  }
}
