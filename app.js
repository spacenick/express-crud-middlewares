var dbFactory = require('./index'),
    express = require('express'),
    app = express();

var ECM = dbFactory({
  persistence:'redis',
  collection:'test'
});

app.use(express.bodyParser());

app.get( '/',             ECM.dbAction('find'));
app.post('/',             ECM.dbAction('save'));


var ECM_mongo = dbFactory({
  persistence:'mongodb',
  collection:'test',
  database:'test'
});

app.get('/mongo',  ECM_mongo.dbAction('find'));

app.listen(3000); 