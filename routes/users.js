var express = require('express');
var router = express.Router();
var models = require('../models');
//var models = require('../models/rel/associations');
const authService = require('../services/auth');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

////////////SIGNUP CDOE////////////
router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  models.users.findOrCreate({
    where: { Username: req.body.username },
    defaults: {
      FirstName: req.body.firstname,
      LastName: req.body.lastname,
      Email: req.body.email,
      Password: authService.hashPassword(req.body.password),
    }
  }).spread(function (result, created) {
    if (created) {
      res.redirect('login');
    } else {
      res.send('This User already exists');
    }
  });
});

////////////LOGIN CODE////////////
router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: {
      Username: req.body.username
    }
  }).then(user => {
    if (!user) {
      console.log('User not found')
      return res.status(401).json({
        message: "Login Failed"
      });
    } else {
      let passwordMatch = authService.comparePasswords(req.body.password, user.Password);
      if (passwordMatch) {
        let token = authService.signUser(user);
        if (token.Admin == true) {
          res.cookie('jwt', token);
          res.redirect('admin');
        } else {
          res.cookie('jwt', token);
          res.redirect('profile');
        }
      } else {
        console.log('Wrong password');
        res.send('Wrong password Dummy!');
      }
    }
  });
});

////////////LOGOUT CODE////////////
router.get('/logout', function (req, res, next) {
  res.cookie('jwt', "", { expires: new Date(0) });
  res.send('See Ya! You are logged out.');
});


////////////PROFILE CODE////////////
router.get('/profile', function (req, res, next) {
  let token = req.cookies.jwt;
  authService.verifyUser(token)
    .then(user => {
      if (user) {
        res.render('profile', {
          FirstName: user.FirstName,
          LastName: user.LastName,
          Email: user.Email,
          Username: user.Username,
          //          PostId: post.PostId,
          //          PostTitle: post.PostTitle,
          //          PostBody: post.PostBody,
        });
      } else {
        res.status(401);
        res.send('Must be logged in Dummy!');
      }
    })
});

////////////ADMIN CODE////////////
router.get('/admin', function (req, res, next) {
  let token = req.cookies.jwt;
  authService.verifyUser(token)
    .then(userAdmin => {
      if (userAdmin) {
        models.users.findAll({
          where: {
            Delete: false,
            FirstName: user.FirstName,
            LastName: user.LastName,
          }
        }),
          res.render('admin', {
            FirstName: user.FirstName,
            LastName: user.LastName,
          });
      } else {
        res.send("Must be Admin");
      }
    });
});

router.get('/admin/editUser/:id', function (req, res, next) {
  if (req.user.Admin) {
    models.users
      .findByPk(parseInt(req.params.UserId))
      .then(user => {
        res.render('editUser', {
          FirstName: user.FirstName,
          LastName: user.LastName,
          Email: user.Email,
          Username: user.Username,
          PostTitle: post.PostTile,
          PostBody: post.PostBody
        })
      })
  } else {
    res.send('Not Allowed');
  }
});

////////////POSTS CODE////////////
router.get('/editPost', function (req, res, next) {
  models.posts
    .findByPk(parseInt(req.params.PostId))
    .then(user => {
      if (user) {
        res.render('editPost', {
          PostId: req.body.postId,
          PostTitle: post.postTitle,
          PostBody: post.postBody,
        });
      } else {
        res.status(401);
        res.send('Must be logged in Dummy!');
      }
    })
});

router.put('/editPost', function (req, res, next) {
  models.posts.findOrUpdate({
    where: { PostId: req.body.postId },
    defaults: {
      PostId: req.body.postId,
      PostTitle: req.body.postTitle,
      PostBody: req.body.postBody,
    }
  }).spread(function (result, created) {
    if (created) {
      res.redirect('profile');
    } else {
      res.send('Try Again');
    }
  });
});

router.get('/newPost', function (req, res, next) {
  res.render('newPost');
});

router.post('/newPost', function (req, res, next) {
  models.posts.findOrCreate({
    where: { PostId: req.body.postId },
    defaults: {
      PostId: req.body.postId,
      PostTitle: req.body.postTitle,
      PostBody: req.body.postBody,
    }
  }).spread(function (result, created) {
    if (created) {
      res.redirect('profile');
    } else {
      res.send('Try Again');
    }
  });
});

////////////DELETE CODE////////////
router.delete("editUser/:id", function (req, res, next) {
  let delId = parseInt(req.params.UserId);
  if (req.user.Admin) {
    models.users
      .update({ Delete: true }, {
        where: { UserId: delId },
      })
      .then(result => res.redirect("admin"))
      .catch(err => {
        res.status(400);
        res.send('Could Not Delete');
      });
  } else {
    res.send('You must be an Admin.');
  }
});

router.delete("editPost/:id", function (req, res, next) {
  let delPost = parseInt(req.params.PostId);
  models.posts
    .update({ Delete: true }, {
      where: { PostId: delPost },
    })
    .then(result => res.redirect("profile"))
    .catch(err => {
      res.status(400);
      res.send('Could Not Delete');
    });
});

module.exports = router;