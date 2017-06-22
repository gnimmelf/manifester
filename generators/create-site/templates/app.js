const manifester = require('manifester');


manifester.use('/admin', (req, res) => res.send('customApp admin'));
manifester.use('/', (req, res) => res.send('customApp'));


manifester.run({ dbPath: `${__dirname}/db`});
