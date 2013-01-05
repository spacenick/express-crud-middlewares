/* Courtesy of naholyr
https://gist.github.com/1175210
www.naholyr.fr
*/
var redis = require('redis');

module.exports = function (options) {

  /**
   * Module options
   */
  var client = redis.createClient(options.port,options.hostname)
    , namespace = '';
  if ('undefined' != typeof options) _set_options_(options)
  else throw new Error('options hash required : collection options needed');

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
    if ('undefined' != typeof options.database)  client.select(options.database);
    if ('undefined' != typeof options.collection) namespace = options.collection;
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
     * Save a bookmark
     * if bookmark has no attribute "id", it's an insertion, else it's an update
     * callback is called with (err, bookmark, created)
     */
    "save": function save (bookmark, callback) {
      var created = ('undefined' == typeof bookmark.id);
      var self = this;
      var onIdReady = function () {
        client.set(_key_(bookmark.id), JSON.stringify(bookmark), function (err) {
          callback(err, bookmark, created);
        });
      }
      if (created) { // No ID: generate one
        client.incr(_seq_(), function (err, id) {
          if (err) return callback(err);
          bookmark.id = id;
          onIdReady();
        });
      } else { // ID already defined: it's an update
        this.findOne(bookmark.id, function (err, old) {
          if (err) return callback(err);
          for (var attr in bookmark) {
            old[attr] = bookmark[attr];
          }
          bookmark = old;
          onIdReady();
        });
      }
    },

    /**
     * Retrieve a bookmark
     * callback is called with (err, bookmark)
     * if no bookmark is found, an error is raised with type=ENOTFOUND
     */
    "findOne": function findOne (id, callback) {
      client.get(_key_(id), function (err, value) {
        if (!err && !value) err = {"message": "Object not found", "type":"ENOTFOUND"};
        if (err) return callback(err);
        var bookmark = null;
        try {
          bookmark = JSON.parse(value);
        } catch (e) {
          return callback(e);
        }
        return callback(undefined, bookmark);
      });
    },

    /**
     * Retrieve all IDs
     * callback is called with (err, bookmarks)
     */
    "find": function find (callback) {
      client.keys(_key_('*'), function (err, keys) {
        if (err) return callback(err);
        client.mget(keys.concat(' '),callback);
      });
    },

    /**
     * Delete a bookmark
     * callback is called with (err, deleted)
     */
    "deleteOne": function deleteOne (id, callback) {
      client.del(_key_(id), function (err, deleted) {
        if (!err && deleted == 0) err = {"message": "Bookmark not found", "type":"ENOTFOUND"};
        callback(err, deleted > 0);
      });
    },

    /**
     * Flush the whole bookmarks database
     * Note that it doesn't call "flushAll", so only "bookmarks" entries will be removed
     * callback is called with (err, deleted)
     */
    "deleteAll": function deleteAll (callback) {
      var self = this;
      client.keys(_key_('*'), function (err, keys) {
        if (err) return callback(err);
        var deleteSequence = function deleteSequence (err, deleted) {
          if (err) return callback(err);
          client.del(_seq_(), function (err, seq_deleted) {
            callback(err, deleted > 0 || seq_deleted > 0);
          });
        }
        if (keys.length) {
          client.del(keys, deleteSequence);
        } else {
          deleteSequence(undefined, 0);
        }
      });
    }

  }

};