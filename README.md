express-crud-middlewares
========================

CRUD middlewares generations for Node Express, with Redis or MongoDB (for now)

** Work in Progress **

Basically it looks like this :

```javascript
var dbFactory = require('express-crud-middlewares');

var ECM = dbFactory({
  persistence:'redis', // 'mongodb' also supported (TODO)
  collection:'album' // will be stored under a namespace prefix on redis
});

// CRUD in a heartbeat! One line per route, that's doing it!
app.get( '/album',    ECM.dbAction('find'));
app.post('/album',    ECM.dbAction('save'));
app.get('/album/:id', ECM.dbAction('findOne'));
app.del('/album/:id',     ECM.dbAction('deleteOne'));
app.del('/album',ECM.dbAction('delete'));

// Want to filter the results?
app.get('/album',     ECM.dbAction('find',function(result) { 
  return result.map(function(item) { 
    item.customDate = new Date(item.customDate); return item; 
  });  
});

// 

```
ECM is absolutely not intended to do your model validation or so. It just allows you to generate a "classic" middleware,
which basically do some db stuff, and returns the result as json.
