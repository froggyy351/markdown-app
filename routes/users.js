var express = require('express');
var router = express.Router();''

const ps = require('@prisma/client');
const prisma = new ps.PrismaClient();

const pagesize = 3;
var cursor = 1;

router.get('/', (req, res, next) => {
  // const page = req.query.page ? +req.query.page : 0;

  prisma.user.findMany({
    orderBy: [{ id: 'asc' }],
    cursor: { id : cursor },
    take: pagesize
  }).then(users => {
    cursor = users[users.length - 1].id;
    const data = {
      title: 'Users/Index',
      content: users
    }
    res.render('users/index', data);
  });
});

router.get('/find', (req, res, next) => {
  const name = req.query.name;
  prisma.user.findMany({
    where: {name: { contains : name }}
  }).then(usrs => {
    var data = {
      title: 'Users/Find',
      content: usrs
    }
    res.render('users/find', data);
  })
});

router.get('/add', (req, res, next) => {
  const data = {
    title: '/Users/Add'
  }
  res.render('users/add', data);
});

router.post('/add', (req, res, next) => {
  prisma.user.create({
    data: {
      name: req.body.name,
      pass: req.body.pass,
      mail: req.body.mail,
      age: +req.body.age
    }
  })
  .then(() => {
    res.redirect('/users');
  });
});

//edit.ejsのGET
router.get('/edit/:id', (req, res, next) => {
  const id = req.params.id;
  prisma.user.findUnique(
    { where: { id : +id } }
  ).then(usr => {
    const data = {
      title: '/Users/edit',
      user:usr
    }
    res.render('users/edit', data);
  });
});


//edit.ejsのPOST
router.post('/edit', (req, res, next) => {
  const {id, pass, name, mail, age} = req.body;
  prisma.user.update({
    where: { id : +id },
    data: {
      name: name,
      pass: pass,
      mail: mail,
      age : +age
    }
  }).then(()=>{
    res.redirect('/users');
  });
});


//delete.ejsのGET
router.get('/delete/:id', (req, res, next) => {
  const id = req.params.id;
  prisma.user.findUnique({
    where: { id : +id }
  }).then(usr => {
    const data = {
      title: '/User/delete',
      user: usr
    }
    res.render('users/delete', data);
  });
});

//delete.ejsのPOST
router.post('/delete', (req, res, next) => {
  prisma.user.delete({
    where : { id : +req.body.id }
  }).then(() => {
    res.redirect('/users');
  });
});


module.exports = router;
