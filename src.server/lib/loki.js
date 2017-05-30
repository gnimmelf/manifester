var loki = require('lokijs');
var deasync = require('deasync');

var db = new loki('./sensitive/survey-results.json');

var db_loaded = false;

// TODO! Load CTDs (Content Type Defintions) - JSONshemas?
db.loadDatabase({}, function() { db_loaded = true; });

console.log('LokiJs loading database')

deasync.loopWhile(function() {
  process.stdout.write('.')
  return !db_loaded
});

console.log(' DB loaded!')


exports.db = db;


exports.ensureCollection = function(collection_name, options={})
{
  if (!db.getCollection(collection_name)) {
    db.addCollection(collection_name, options)
  }
  return db.getCollection(collection_name);
}


exports.clearCollection = function(collection_name) {
  return db.getCollection(collection_name).removeDataOnly();
}