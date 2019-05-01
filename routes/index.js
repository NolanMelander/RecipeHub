var express = require('express');
var router = express.Router();
var passport = require('passport')

var sess;
const pg = require('pg')
const connectionString = 'INSERT DATABASE INFO HERE'

const accessProtectionMiddleware = (req, res, next) => {  
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({
      message: 'must be logged in to continue',
    });
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  var sess = req.session
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT users.*, recipes.*, rateing.* FROM users INNER JOIN recipes ON users.id = recipes.user_id INNER JOIN rateing ON recipes.id = rateing.recipe_id", function(err, result) {
      done();
      if(err) console.log("Error during query", err)
      else {
        console.log(result.rows)    
        return res.render('index', {page:'Home', menuId:'home', justadded: result, sess: req.session});
      }
    })
  })
});


router.get('/ratings', function(req, res, next) {
  var sess = req.session
  if(!sess.username)
  {
    res.redirect('/register')
  }
  else
  {
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM recipes", function(err, result) {
      done();
      if(err) console.log("Error during query", err)
      else {
        console.log(result.rows)    
        return res.render('ratings', {page:'Home', menuId:'home', preparelist: result});
      }
    })
  })
}});

router.get('/search', function(req, res, next) {
  res.render('search', {page: 'Search', menuId:'search'})
});

router.get('/addrecipe', function(req,res,next) {
  var sess = req.session
  if(!sess.username){
    res.redirect('/register')
  } else {

  var measure
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM measurements", function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        measure = result
      }
    })
    client.query("SELECT ingredients.*, measurements.* FROM ingredients INNER JOIN measurements ON ingredients.measurement_id = measurements.id", function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        console.log(result.rows)
        res.render('addrecipe', {page: 'Add Recipe', menuId: 'addrecipe', tableresults: result, measure: measure, username: sess.username})
      }
    })
  })
}});

router.get('/measurements', function(req,res,next) {
  var sess = req.session
  if(!sess.username)
  {
    res.redirect("/register")
  } else {
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM measurements", function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        console.log(result.rows)
        res.render('measurements', {page: 'Add Measurements', menuId: 'addmeasurements', tableresults: result})
      }
    })
  })
}});

router.get('/ingredient', function(req,res,next) {
  var measure
  var sess = req.session
  if(!sess.username)
  {
    res.redirect("/register")
  } else {
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM measurements", function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        measure = result
      }
    })
    client.query("SELECT ingredients.*, measurements.* FROM ingredients INNER JOIN measurements ON ingredients.measurement_id = measurements.id", function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        console.log(result.rows)
        res.render('ingredient', {page: 'Add Ingredients', menuId: 'addingredients', tableresults: result, measure: measure})
      }
    })
  })
}});

router.get('/addtags', function(req,res,next) {
  var sess = req.session
  if (!sess.username){
    res.redirect('/register')
  } else {
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM tags", function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        console.log(result.rows)
        res.render('addtags', {page: 'Add Tags', menuId: 'addtags', tableresults: result})
      }
    })
  })
}});

router.get('/about', function(req, res, next) {
  res.render('about', {page:'About Us', menuId:'about'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {page:'Contact Us', menuId:'contact'});
});

router.get('/profile', function(req, res, next) {
  sess = req.session;
  console.log("PROFILE PAGE ID",sess.userID)
  if(sess.username)
  {
    pg.connect(connectionString, function(err, client, done) {
      client.query("SELECT * FROM recipes WHERE user_id IN ($1)", [sess.userID], function(err, result) {
        if(err) console.log("Error during query", err)
        else{
          if(result.rows.length > 0)
          {
            res.render('profile', {page: 'Profile', menuId: 'profile', username: sess.username, display: result})
          }
          else res.render('profile', {page: 'Profile', menuId: 'profile', username: sess.username, display: result})
        }
      })
    })
  }
  else
  {
    res.redirect("/register")
  }
});

router.post('/rate', function(req, res, next) {
  console.log("EDIT RATING: ", req.body.editrating)
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM rateing WHERE recipe_id IN ($1)", [req.body.editrating],function(err, result) {
      if(err) console.log("Error during query", err)
      else{
        if(result.rows.length > 0)
        {
          var newrating = req.body.score + result.rows[0].ratings
          var newtotal = newrating / 5.0
          console.log(result.rows.length)
          client.query("UPDATE rateing SET total = ($1), ratings = ($2) WHERE recipe_id = ($3)", [newtotal, newrating, req.body.editrating])
          res.redirect('/')
        }
        else
        {
          //client.query("SELECT column_name, data_type, character_maximum_length FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = ($1)", ["rateing"], function(err, result) {
          //  if(err) console.log("Error during querry", err)
          //  console.log(result.rows)
         // })
          client.query("INSERT INTO rateing(recipe_id, total, ratings) VALUES ($1, $2, $3)", [req.body.editrating, req.body.score, req.body.score], function(err, result) {
            done();
            if(err) console.log("Error during Querry", err)
            res.redirect('/')
          })
        }
      }
    })
  })
});

router.post('/profile', function(req, res, next) {
  res.redirect('/profile')

});

router.post('/recipe2', function(req, res, next) {
  var sess = req.session;
  req.session.steps = req.body.steps
  if(sess.username){
    sess.steps = req.body.steps
    res.render('newrecipe', {page: 'Add Recipe', menuId: 'profile', username: sess.username, steps: sess.steps})
  }
  else{
    res.redirect("/register")
  }
})

router.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy(function(err) {
    if(err) {
      console.log(err)
    }
    else {
      res.redirect('/')
    }
  })
});


router.post('/newingred', function(req, res) {
  var ingredient = req.body.newingredient
  var ingredamount = req.body.ingredamount
  var measure = req.body.measure

  console.log(ingredient)
  console.log(ingredamount)
  console.log(measure)
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM ingredients WHERE ingredient_name in ($1) AND amount in ($2) AND measurement_id in ($3)", [ingredient, ingredamount, measure], function (err, result) {
      if(err) console.log("Error during query", err)
      else if (result.rows.length > 0) {
        console.log("Ingredient already exists")
      }
      else
      {
        client.query("INSERT INTO ingredients(ingredient_name, amount, measurement_id) VALUES ($1, $2, $3)", [ingredient, ingredamount, measure], function(err, result) {
          if(err) console.log("Error during insert", err)
        })
      }
    })
    client.query("SELECT ingredients.*, measurements.* FROM ingredients INNER JOIN measurements ON ingredients.measurement_id = measurements.id", function(err, result) {
      done();
      if(err) return console.log("Error during query", err)
      else
      console.log(result.rows)

    }) 
  })
  res.redirect('/ingredient')
})

router.post('/recipe3', function(req, res) {
  var sess = req.session
  console.log(sess.username)
  if(sess.username){
    pg.connect(connectionString, function(err, client, done) {
      client.query("SELECT id FROM users WHERE username IN ($1)", [sess.username], function (err, result) {
        if(err){
          console.log("Error during query", err)
          return res.redirect('/') 
        }
        else if (result.rows.length > 0) {
          console.log(result.rows[0].id)
          sess.userID = result.rows[0].id
          console.log(sess.userID)
          console.log(req.body.recipename)

          client.query("INSERT INTO recipes(recipe_name, user_id) VALUES ($1, $2)", [req.body.recipename, sess.userID], function(err, result) {
            if(err) console.log("Error during query")
            else
            {
              client.query("SELECT id FROM recipes WHERE recipe_name IN ($1)", [req.body.recipename], function(err, result) {
                if(err) console.log("Error duing query")
                else {
                  console.log(result.rows[0].id)
                  sess.recipeID = result.rows[0].id
                  if (sess.steps >= 0)
                  {
                    client.query("INSERT INTO instructions(recipe_id, sequence, instruction) VALUES ($1, $2, $3)", [sess.recipeID, 1, direction1], function(err, result) {
                      if(err) console.log("Error during insert", err)
                    })
                  }
                  if (sess.steps >= 1)
                  {
                    client.query("INSERT INTO instructions(recipe_id, sequence, instruction) VALUES ($1, $2, $3)", [sess.recipeID, 2, direction2], function(err, result) {
                      if(err) console.log("Error during insert", err)
                    })
                  }
                  if (sess.steps >= 2)
                  {
                    client.query("INSERT INTO instructions(recipe_id, sequence, instruction) VALUES ($1, $2, $3)", [sess.recipeID, 3, direction3], function(err, result) {
                      if(err) console.log("Error during insert", err)
                    })
                  }
                  if (sess.steps >= 3)
                  {
                    client.query("INSERT INTO instructions(recipe_id, sequence, instruction) VALUES ($1, $2, $3)", [sess.recipeID, 4, direction4], function(err, result) {
                      if(err) console.log("Error during insert", err)
                    })
                  }
                }
              })
            }
          })
          return res.redirect('/')
          }
        else{
          console.log("User Id Missing")
          res.redirect('/')
        }
      })
    })
  }
  else
  res.redirect('/')
})


router.post('/newmeasure', function(req, res) {
  var measure = req.body.newmeasurement
  console.log(measure)
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM measurements WHERE size in ($1)", [measure], function (err, result) {
      if(err) console.log("Error during query", err)
      else if (result.rows.length > 0) {
        console.log("Measurement already exists")
      }
      else
      {
        client.query("INSERT INTO measurements(size) VALUES ($1)", [measure], function(err, result) {
          if(err) console.log("Error during insert", err)
        })
      }
    })
    client.query("SELECT * FROM measurements", function(err, result) {
      done();
      if(err) return console.log("Error during query", err)
      else
      console.log(result.rows)

    }) 
  })
  res.redirect('/measurements')
})

router.post('/add', function(req, res) {
  var tag = req.body.newtag
  console.log(tag)
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM tags WHERE tag_name in ($1)", [tag], function (err, result) {
      if(err) console.log("Error during query", err)
      else if (result.rows.length > 0) {
        console.log("Tag already exists")
      }
      else
      {
        client.query("INSERT INTO tags(tag_name) VALUES ($1)", [tag], function(err, result) {
          if(err) console.log("Error during insert", err)
        })
      }
    })
    client.query("SELECT * FROM tags", function(err, result) {
      done();
      if(err) return console.log("Error during query", err)
      else
      console.log(result.rows)

    }) 
  })
  res.redirect('/addtags')
})

router.get('/register', function(req, res) {
  res.render('register', {page:'Register', menuId: 'register'})
})

router.post('/login', function(req, res) {
    var sess = req.session;
    var passwords = req.body.password
    var emails = req.body.email
    pg.connect(connectionString, function(err, client, done) {
      client.query("SELECT * FROM users WHERE email IN ($1) AND password IN ($2)", [emails, passwords], function(err, result) {
        done();
        console.log(result.rows)
        if(err) return console.log("Error during query", err)
        if (result.rows.length > 0) {
          console.log(result.rows[0].username)
          sess.username = result.rows[0].username
          sess.userID = result.rows[0].id
          console.log("ID", sess.userID)
          console.log("RESULTS: ", result.rows[0].id)
          return res.redirect('/profile')
        }
        else {
          return res.render('register', {page: 'Register', menuId: 'register'})
        }

      })
    })
    
})

router.post('/reg', function(req,res) {
  var username = req.body.username
  var password = req.body.password
  var emails = req.body.email
  var sess = req.session
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * FROM users WHERE email IN ($1)", [emails], function(err, result) {
      if(err) return console.log('Error during query', err);
      if (result.rows.length > 0)
      {
        console.log("Email Exists")
        return res.render('register', {page: 'Register', menuId: 'register'})
      }
    });

    client.query("SELECT * FROM users WHERE username IN ($1)", [username], function(err, result) {
       if(err) return console.log('error happened during query', err);
       if (result.rows.length > 0)
       {
        done();
         console.log("User already exists")
         return res.render('register', {page: 'Register', menuId: 'register'})
       }
       else {
         client.query("INSERT INTO users(username, email, password) VALUES ($1, $2, $3)", [username, emails, password], function(err, result) {
           done();
           if(err) return console.log("Error during insert", err);
         }) 
         sess.username = username
         return res.redirect('/profile')
       }
       
    });
  });
})

//FACEBOOK PASSPORT
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/', session: true}),
  (req, res) => {
    var sess = req.session
    sess.username = req.user.displayName
    sess.userID = req.user.id
    sess.userEmail = req.user.email
    console.log('Woo we authenticated, here is our user object', req.user);
    // res.json(req.user);
    res.redirect('/profile')
});

//GOOGLE PASSPORT
router.get('/auth/google', passport.authenticate('google'));

router.get('/auth/google/callback',
  passport.authenticate('google', {failureRedirect: '/', session: true}),
  (req, res) => {
    var sess = req.session
    sess.username = req.user.displayName
    req.session.userID = req.user.id
    sess.userEmail = req.user.email
    console.log(req.user.displayName)
    pg.connect(connectionString, function(err, client, done) {
      client.query("SELECT * FROM users WHERE password IN ($1)", [req.user.id,], function(err, result) {
        if(err) console.log("Error at query", err)
        else if (result.rows.length > 0)
        {
          req.session.userID = result.rows[0].id
        }
        else
        {
          client.query("INSERT INTO users(username,email,password) VALUES ($1, $2, $3)", [sess.username, req.user.emails[0].value, req.user.id], function(err, result) {
            if(err) console.log("Error at query", err)
            else {
              client.query("SELECT * FROM users WHERE username in ($1)", [req.user.displayName], function(err,result) {
                req.session.userID = result.rows[0].id
              })
            }
          })
        }
      })
    })
    console.log('Woo we authenticated, here is our user object', req.user);
    req.session.userID = 2
    // res.json(req.user);
    res.redirect('/profile')
});

// A secret endpoint accessible only to logged-in users
router.get('/protected', accessProtectionMiddleware, (req, res) => {  
  res.json({
    message: 'You have accessed the protected endpoint!',
    yourUserInfo: req.user,
  });
});

module.exports = router;