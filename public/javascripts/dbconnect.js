const pg = require('pg')
const connectionString = 'postgres://qjjtrndhexdzup:fbcfc7bec66236640e0d1348d40cc444fd414759376cf5dd2a458a02eea8e0f2@ec2-54-243-223-245.compute-1.amazonaws.com:5432/d75siuapddel2u'

pg.connect(connectionString, function(err, client, done) {
  client.query('SELECT * FROM users', function(err, result) {
     done();
     if(err) return console.log('error happened during query', err);
     console.log(result.rows);
  });
});
