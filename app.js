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
app.listen(3000); 