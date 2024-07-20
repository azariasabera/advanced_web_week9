var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('dotenv').config();
require('../auth/validateToken');

// =================== mongoDB setup ===================
const mongoose = require('mongoose');
const Users = require("../models/Users");
const Todo = require("../models/Todo");

const mongoDB = 'mongodb://127.0.0.1:27017/testdb';
mongoose.connect(mongoDB)
        .then(() => console.log("MongoDB is connected!"))
        .catch((error) => console.log(`Error has occured: ${error}`));

mongoose.Promise = Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error!!!"));
// =====================================================

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/user/register', 
  body('email').isEmail(),
  body('password')
  .isLength({ min: 8 })
  .matches(/[a-z]/)
  .matches(/[A-Z]/)
  .matches(/[0-9]/)
  .matches(/[~`!@#$%^&*()-_+={}[]|\;:"<>,.?|\/]/) // to include / used \ before /
  
  ,(req, res, next)=>{  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
  // See the teacher's code for .findOne() method in week7 repo.
    Users.findOne({email: req.body.email})
        .then(async (user) => {
            if(!user){
              const hashedPassword = await bcrypt.hash(req.body.password, 10)
                let newUser = new Users({
                    email: req.body.email,
                    password: hashedPassword
                });
                newUser.save();
                res.send('User registered');
            } else {
                res.status(403).send('email already exists');
            }
        }).catch((error) => {
            res.status(500).send(`Error occured: ${error}`);
        });
});
//// at least one lowercase letter, one uppercase letter, one number, and one special character
router.post('/api/user/login', 
  body('email').isEmail(),
  body('password')
  .isLength({ min: 8 })
  .matches(/[a-z]/)
  .matches(/[A-Z]/)
  .matches(/[0-9]/)
  .matches(/[~`!@#$%^&*()-_+={}[]|\;:"<>,.?|\/]/) // to include / used \ before /
  
  ,async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    Users.findOne({email: req.body.email})
        .then(async (user) => {
            if(user){
                if(await bcrypt.compare(req.body.password, user.password)){
                    const tokenPayload = {
                        email: user.email
                    }
                    jwt.sign(
                      tokenPayload, 
                      process.env.SECRET,
                      {expiresIn: '1h'},
                      (error, token) => {
                          if(error){
                              res.status(403).send(`Error in signing: ${error}`);
                          } else {
                              res.json({
                                success: true,
                                token: token});
                          }
                      })}
                else{
                    res.status(403).send('Login failed, password incorrect');
                }
            }
            else{
                res.status(403).send('Login failed, user not found');
            }
        }
    ).catch((error) => {
        res.status(500).send(`Error in .findOne: ${error}`);
    });
});

router.get('/api/private',  
  passport.authenticate('jwt', {session: false}),
  (req, res)=>{
      res.json({email: req.user});
      // not req.email, even though I sent return done(null, email) in validateToken.js
});

router.post('/api/todos',
  passport.authenticate('jwt', {session: false}),
  async (req, res) => {
    try {
      const user = await Users.findOne({ email: req.user });
      if (!user) {
        return res.status(403).send('User not found');
      }

      const user_id = user._id;

      let todo = await Todo.findOne({ user: user_id });

      if (todo) {
        // Merges new items with the existing items
        todo.items = todo.items.concat(req.body.items);
        await todo.save();
        return res.json(todo);
      } else {
        const newTodo = new Todo({
          user: user_id,
          items: req.body.items
        });
        await newTodo.save();
        return res.json(newTodo);
      }
    } catch (error) {
      return res.status(500).send(`Error occurred: ${error}`);
    }
  }
);


module.exports = router;
