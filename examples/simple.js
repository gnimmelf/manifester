const manifester = require('../index');

manifester.use('/surveys', manifester.middleware.authorize, (req, res) => res.send('customApp surveys'));
manifester.use('/', (req, res) => res.send('customApp'));

console.log(manifester.db.content.get('users'))

console.log(manifester.db.content.query)

manifester.run();