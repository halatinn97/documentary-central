
const express = require('express'),
      app = express(),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      mongoose = require('mongoose'),
      Models = require('./models.js'),
      Documentaries = Models.Documentary,
      Users = Models.User;


mongoose.connect('mongodb://localhost:27017/movieAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('common'));
app.use(express.static('public'));


//Authorization, validation

const cors = require('cors');

app.use(cors());

const passport = require('passport');
require('./passport');

let auth = require('./auth')(app);

const { check, validationResult } = require('express-validator');


//CREATE
//Titles for index & documentation page
app.get('/', passport.authenticate('jwt', { session: false}), (req,res) => {
  res.send('What is your favorite movie?');
});


app.get('/documentation', passport.authenticate('jwt', { session: false}), (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});


//Search for all existing users

app.get('/users', passport.authenticate('jwt', { session: false}), function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
})
//CREATE
//Allows new users to register

app.post('/users',
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// Checks validation object for errors
   let errors = validationResult(req);

   if (!errors.isEmpty()) {
     return res.status(422).json({ errors: errors.array() });
   }

  let hashedPassword = Users.hashPassword(req.body.Password);

// Searches to see if  user with requested username already exists
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            FavoriteDocumentaries: req.params.FavoriteDocus
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//UPDATE endpoint
//Allow users to update info
app.put('/users/:Username',
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
], passport.authenticate('jwt', { session: false}), (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  Users.findOneAndUpdate(
    {Username: req.params.Username},
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
        FavoriteDocumentaries: req.params.FavoriteDocus
      },
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});


//CREATE
//Allows user to add a documentary to list of favorite
app.post('/users/:Username/documentaries/:DocumentaryID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteDocumentaries: req.params.DocuID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


//DELETE
//Allows user to remove documentary from their list of favorites
 app.delete("/users/:Username/documentaries/:DocumentaryID", (req, res) => {
   Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteDocumentaries: req.params.DocuID }
   },
   { new: true },
   (err, updatedUser) => {
     if (err) {
       console.error(err);
       res.status(500).send('Error: ' + err);
     } else {
       res.json(updatedUser);
     }
   });
 });

//DELETE
//Allows user to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//READ
//Return a list of all documentaries to users
app.get('/documentaries', passport.authenticate('jwt', { session: false }), (req, res) => {
  Documentaries.find()
  .then((documentaries) => {
    res.status(201).json(documentaries);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Returns data about single documentary by title to user
app.get('/documentaries/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Documentaries.findOne({Title: req.params.Title})
    .then((documentary) => {
      res.json(documentary);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ
//Return data about genre by main title
app.get('/documentaries/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Documentaries.findOne({'Genre.Name': req.params.Name})
    .then((genre) => {
      res.json(genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ
//Return data about a featured personality by name
app.get('/documentaries/featuredPersonalities/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Documentaries.findOne({'FeaturedPersonality.Name': req.params.Name})
    .then((documentary) => {
      res.json(documentary.FeaturedPersonality);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});




//Error handling

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oops, something went wrong!');
});


//Start server
app.listen(8080,() =>
  console.log('Server is listening on port 8080.')
);
