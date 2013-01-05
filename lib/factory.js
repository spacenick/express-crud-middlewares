/* Factory in charge of returning a method allowing us 
to quickly create Express middleware on the fly
based on a choosen persistence strategy (redis, mongodb..) */
var redisPersistence = require('./persistence/redis');

module.exports = function(options) {

    var db,
    port,
    collection = '' || options.collection,
    database = '' || options.database,
    hostname = '127.0.0.1' || options.hostname;

    if (typeof options.persistence === 'undefined') throw new Error({message:"You need to give a 'persistence' options to the factory baby. Supported values : 'redis', 'mongodb'"});

    if (options.persistence == "redis") { 
      port = 6379 || parseInt(options.port);
      db = redisPersistence({collection:collection,database:database,hostname:hostname});
    } else if (options.persistence == 'mongodb') {
      // To be Implemented
    } else {
      throw new Error({message:"Persistence option not supported."});
    }

    // Public API
    /* Courtesy of naholyr
    https://gist.github.com/1175210
    www.naholyr.fr
    */
    return {
      // Function that generates a middleware.
      dbAction:function (action, filter) {
        // Default filter = identity
        filter = filter || function (v) { return v; };
        return function (req, res, next) {
          var params = [];

          // Parameters depend of DB action
          switch (action) {
            case 'save':      params.push(req.body);        break;
            case 'findOne':
            case 'deleteOne': params.push(req.param('id')); break;
          }
          // Last parameter is the standard response
          params.push(function (err, result) {
            err ? next(err) : res.json(filter(result));
          });
          // Execute DB action
          db[action].apply(db, params);
        }
      } 
    }
}