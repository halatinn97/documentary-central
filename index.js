
const express = require('express'),
      app = express(),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');


app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));

let users = [
  {
    id: 1,
    name: "Bob",
    favoriteDocus: []
  },
  {
    id: 2,
    name: "Joe",
    favoriteDocus: []
  }
]

let documentaries = [
  {
    "Title": "Seaspiracy",
    "Year": "2021",
    "Director": {
      "Name": "Ali Tabrizi",
      "Birth": "1993",
      "Biography": "Tabrizi turned down an offer to study film at university, and taught himself. He made Seaspiracy with Kip Andersen as a producer. Together with his partner and fellow filmmaker Lucy Manning, he founded a media company and started a podcast.Ali Tabrizi is a director and cinematographer, known for Seaspiracy (2021) and Vegan 2018 (2018)."
    },
    "Genre": {
      "Name": "Environment"
    }
  },
  {
    "Title": "Secrets of the Saqqara Tomb",
    "Year": "2003",
    "Director": {
      "Name": "James Tovell",
      "Birth": "1993",
      "Biography": "James Tovell is best known for his Netlix documentary Saqqara Tomb where he follows a team of Egyptian archeologists that discover a tomb from the 25th century BC Egypt."
    },
  },
  {
    "Title": "One Strange Rock",
    "Year": "2018",
    "Director": {
      "Name": "Christopher Riley & co.",
      "Birth": "1967",
      "Biography":"A British writer, broadcaster and film maker specialising in the history of science. Christopher pioneered the use of digital elevation models in the study of mountain range geomorphology and evolution. He makes frequent appearances on British television and radio, broadcasting mainly on space flight, astronomy and planetary science. Christopher is most well known for the docu-series 'One Strange Rock' and 'Space Odyssey'."
    },
    "Genre": {
      "Name": "Science"
    }
  },
  {
    "Title": "My Octopus Teacher",
    "Year": "2010",
    "Director": {
      "Name":["Pippa Ehrlich", "James Reed"],
      "Birth": "1967",
      "Biography":"Pippa Ehrlich and James Reed dated for a while. They are best known for the Netlix documentary 'My Octopus Teacher' and won award for Best Documentary Feature. When Forster saw an octopus during one of their diving trips, which he visited regularly from then on, the idea for My teacher, the octopus was born . After a first draft of the script, Ehrlich agreed in 2017 to co-direct the project with James Reed . [1] This was her debut film. Forster had already filmed some of the material on his own. Ehrlich also took care of the film editing in addition to the shoot, during which she also dived with Forster herself "
    },
    "Genre": {
      "Name": "Nature"
    }
  },
];

//CREATE
//Allows new users to register
app.post('/users', (req,res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('Users need names')
  }
});

//UPDATE endpoint
//Allow users to update info
app.put('/users/:id', (req, res) => {
  const {id} = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if(user) {
    user.name = updatedUser.name;
    res.status(200).json(user)
  } else {
    res.status(400).send('No such user')
  }
});


//CREATE
//Allows user to add a docu to list of favorite
app.post('/users/:id/:docuTitle', (req, res) => {
  const {id, docuTitle} = req.params;

  let user = users.find(user => user.id = id);

  if (user) {
    user.favoriteDocus.push(docuTitle);
    res.status(200).send(`${docuTitle} has been added to user ${id}'s array`);
  } else {
      res.status(400).send('No such user')
    }
});

//DELETE
//Allows user to remove docu from their list of favorites
app.delete('/users/:id/:docuTitle', (req, res) => {
  const {id, docuTitle} = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteDocus = user.favoriteDocus.filter(title => title !== docuTitle);
    res.status(200).send(`${docuTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('No such user')
  }
});

//DELETE
//Allows user to deregister
app.delete('/users/:id', (req, res) => {
  const {id} = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`User ${id} has been removed`);
  } else {
    res.status(400).send('No such user')
  }
});


//READ
//Return a list of all movies to users
app.get('/documentaries', (req, res) => {
  res.status(200).json(documentaries);
});

//Returns data about single movie by title to user
app.get('/documentaries/:title', (req, res) => {
  const {title} = req.params;
  const documentary = documentaries.find(documentary => documentary.Title === title);

  if(documentary) {
    res.status(200).json(documentary);
  } else {
    res.status(400).send('No such documentary')
  }
});

//READ
//Return data about genre by main title
app.get('/documentaries/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = documentaries.find(documentary => documentary.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre');
  }
});

//READ
//Return data about a director by name
app.get('/documentaries/directors/:directorName', (req, res) => {
  const {directorName} = req.params;
  const director = documentaries.find(documentary => documentary.Director.Name === directorName).Director;

  if(director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director');
  }
});




//CREATE
//Titles for index & documentation page
app.get('/', (req,res) => {
  res.send('What is your favorite movie?');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});




/*Error handling

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oops, something went wrong!');
});
*/

//Start server
app.listen(8080,() =>
  console.log('Server is listening on port 8080.')
);
