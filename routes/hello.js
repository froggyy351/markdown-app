const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3');

//データベースオブジェクトの取得。
const db = new sqlite3.Database('mydb.db');

//GET処理
router.get('/', (req, res, next) => {
    db.serialize(() => {
        var rows = "";
        db.each("select * from mydata", (err, row) => {
            if (!err) {
                rows += "<tr><th>" + row.id + "</th><td>" + row.name + "</td></tr>";
            }
        }, (err, count) => {
            if(!err) {
                var data = {
                    title: 'Hello!',
                    content: rows
                };
                res.render('hello/index', data);
            }
        });
    });
});

const { check, validationResult} = require('express-validator');

//GET処理　Insert
router.get('/add', (req, res, next) => {
    var data = {
        title: 'Hello/add',
        content: '新しいレコードを入力: ',
        form: {name:'', mail:'', age:0}
    }
    res.render('hello/add', data);
});

//POST処理　Insert
router.post('/add',[
    check('name','NAME は必ず入力してください。').notEmpty().escape(),
    check('mail','MAIL はメールアドレスを記入してください。').isEmail().escape(),
    check('age','AGE は年齢(整数)を入力してください)').isInt(),
    check('age','AGE は0以上120以下で入力してください。').custom(value => {
        return value >= 0 && value <= 120;
    })
], (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        var result = '<ul class="text-danger">';
        var result_arr = errors.array();
        for (var n in result_arr) {
            result += '<li>' + result_arr[n].msg + '</li>'
        }
        result += '</ul>';
        var data = {
            title: 'Hello/add',
            content: result,
            form: req.body
        }
        res.render('hello/add', data);
    } else {
        const nm = req.body.name;
        const ml = req.body.mail;
        const ag = req.body.age;
        db.serialize(() => {
            db.run('Insert into mydata (name, mail, age) values (?, ?, ?)', nm, ml, ag);
        });
    res.redirect('/hello');
    }
});

//GET処理　Select
router.get('/show', (req, res, next) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                    title: '/Hello/show',
                    content: 'id' + id + ' のレコード：',
                    mydata: row
                }
                res.render('hello/show', data);
            }
        });
    });
});

//GET処理　Update
router.get('/edit', (req, res, next) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = 'select * from mydata where id = ?';
        db.get(q, [id], (err, row) => {
            if(!err) {
                var data = {
                    title: 'hello/edit',
                    content: 'id = ' + id + ' のレコードを編集する',
                    mydata: row
                }
                res.render('hello/edit', data);
            }
        });
    });
});

//POST処理　Update
router.post('/edit', (req, res, next) => {
    const id = req.body.id;
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;
    const q = "update mydata set name = ?, mail = ?, age = ? where id = ?";
    db.serialize(() => {
        db.run(q, nm, ml, ag, id);
    });
    res.redirect('/hello');
});


//GET処理　delete
router.get('/delete', (req, res, next) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = 'select * from mydata where id = ?';
        db.get(q, [id], (err, row) => {
            if(!err) {
                var data = {
                    title: 'Hello/delete',
                    content: 'id = ' + id + 'のレコードを削除：',
                    mydata: row
                }
                res.render('hello/delete', data);
            }
        });
    });
});

//POST処理　delete
router.post('/delete', (req, res, next) => {
    const id = req.body.id;
    db.serialize(() => {
        const q = 'delete from mydata where id = ?'
        db.run(q, id);
    });
    res.redirect('/hello');
});

//GET処理　find
router.get('/find', (req, res, next) => {
    db.serialize(() => {
        db.all('select * from mydata', (err, rows) => {
            if(!err) {
                var data = {
                    title: 'Hello/find',
                    find: '',
                    content: '検索条件を入力してください',
                    mydata: rows
                };
                res.render('hello/find', data);
            }
        });
    });
});


//POST処理 find
router.post('/find',(req, res, next) => {
    var find = req.body.find;
    db.serialize(() => {
        var q = "select * from mydata where ";
        db.all(q + find, [], (err, rows) => {
            if(!err) {
                var data = {
                    title: 'Hello/find',
                    find: find,
                    content: '検索条件 ' + find,
                    mydata: rows
                }
                res.render('hello/find', data);
            }
        });
    });
});



// const http = require('https');
// const parseString = require('xml2js').parseString;

//GoogleニュースのRSSページへのアクセスとデータ取得
// router.get('/', (req, res, next) => {
//     var opt = {
//         host: 'news.google.com',
//         port: 443,
//         path: '/rss?hl=ja&ie=UTF-8&oe=UTF-8&gl=JP&ceid=JP:ja'
//     };

//     http.get(opt, (res2) => {
//         var body = '';
//         res2.on('data', (data) => {
//             body += data;
//         });
//         res2.on('end', () => {
//             parseString(body.trim(), (err, result) => {
//                 console.log(result);
//                 var data = {
//                     title: 'Google News',
//                     content: result.rss.channel[0].item
//                 };
//                 res.render('hello', data);
//             });
//         });
//     });
// });

// router.get('/', (req, res, next) => {
//     var msg = '※何か書いて送信してください。';
//     if(req.session.message != undefined) {
//         msg = "Last Message:" + req.session.message
//     }
//     var data = {
//         title: 'Hello!',
//         content: msg
//     }
//     res.render('hello', data);
// });

// router.post('/post', (req, res, next) => {
//     var msg = req.body['message'];
//     req.session.message = msg;
//     var data = {
//         title: 'Hello!',
//         content: 'Last Message: ' + req.session.message
//     }
//     res.render('hello', data);
// });

module.exports = router;