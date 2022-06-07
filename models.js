const mongoose = require('mongoose'),
      bcrypt = require('bcrypt');


let documentarySchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  ReleaseYear: {type: Number, required: true},
  FeaturedPersonality: {
    Name: String,
    Birth: Number,
    Biography: String,
  },
  Genre: {
    Name: String,
    Description: String
  },
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavoriteDocumentaries: [{type: mongoose.Schema.Types.ObjectId, ref: 'Docu'}]
});


//Hashes submitted passwords

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

//Compares hashed passwords with those stored in database

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Documentary = mongoose.model('Documentary', documentarySchema);
let User = mongoose.model('User', userSchema);

module.exports.Documentary = Documentary;
module.exports.User = User;
