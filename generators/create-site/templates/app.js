const manifester = require('manifester');

manifester.use('/admin', (req, res) => res.send('customApp admin'));
manifester.use('/', (req, res) => res.send('customApp'));

manifester.run();

module.exports = manifester._app;
