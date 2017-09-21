const manifester = require('manifester');

manifester.use('/', (req, res) => res.send('customApp\n'));

manifester.run();
