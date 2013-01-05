var mongojs = require('mongojs');

module.exports = function (options) {

  /**
   * Module options
   */
  var namespace, database, hostname, port;

  if ('undefined' != typeof options) _set_options_(options)
  else throw new Error('options hash required : collection & database options needed');


  var client = mongojs(hostname+':'+port+'/'+database,[namespace]);

  /**
   * Privates
   */
  // Get bookmark key name
  function _key_ (id) {
    return namespace + ':' + id + ':json';
  }
  // Get sequence key name
  function _seq_ () {
    return namespace + '::sequence';
  }
  // Update internal options
  function _set_options_ (options) {
    if ('undefined' != typeof options.database)  database = options.database;
    if ('undefined' != typeof options.collection) namespace = options.collection;
    if ('undefined' != typeof options.port)  port = options.port;
    if ('undefined' != typeof options.hostname) hostname = options.hostname;
    return this;
  }

  return {

    /**
     * Update options
     */
    "configure": _set_options_,

    /**
     * Allow disconnection
     */
    "close": function disconnect (callback) {
      if (client.connected) client.quit();
      if (callback) client.on('close', callback);
    },
    /**
     * Retrieve a bookmark
     * callback is called with (err, bookmark)
     * if no bookmark is found, an error is raised with type=ENOTFOUND
     */
    "findOne": function findOne (id, callback) {
      client[namespace].findOne({_id:id}, function (err, document) {
        if (!err && !value) err = {"message": "Object not found", "type":"ENOTFOUND"};
        return callback(err, document);
      });
    },
    // We could define "find" : client[namespace].find
    // but factory is calling the presistence method binded to their own scope.
    "find" : function find(callback) {
      return client[namespace].find(callback);
    }

  }

};