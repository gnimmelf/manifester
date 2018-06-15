const manifester = require('manifester');

manifester.get('/', (req, res) => res.send('customApp\n'));

manifester.run();
