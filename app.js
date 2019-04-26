
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bread.db');

var bodyParser = require('body-parser');  // ngambil inputan dari form

var app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/', express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;
    const url = req.url == '/' ? '/?page=1' : req.url

    let filter = [];
    let flag = false

    if (req.query.checkid && req.query.formid) {
        filter.push(`id = ${req.query.formid}`)
        flag = true
        // console.log(req.query.formid);
    }
    if (req.query.checkstring && req.query.formstring) {
        filter.push(`string = '${req.query.formstring}'`)
        flag = true
    }
    if (req.query.checkinteger && req.query.forminteger) {
        filter.push(`integer = '${req.query.forminteger}'`)
        flag = true
    }
    if (req.query.checkfloat && req.query.formfloat) {
        filter.push(`float = '${req.query.formfloat}'`)
        flag = true
    }
    if (req.query.checkdate && req.query.formsdate && req.query.formedate) {
        filter.push(`date between '${req.query.formsdate}' AND '${req.query.formedate}'`)
        flag = true
    }
    if (req.query.checkboolean && req.query.formboolean) {
        filter.push(`boolean = '${req.query.formboolean}'`)
        flag = true
    }


    let sql = `select count(*) as total from paket`
    if (flag) {
        sql += ` where ${filter.join(' AND ')}`
    }
    // console.log(sql);

    db.all(sql, (err, count) => {
        const total = count[0].total;
        const pages = Math.ceil(total / limit);
        sql = `select * from paket`;

        if (flag) {
            sql += ` where ${filter.join(' AND ')}`
        }
        sql += ` limit ${limit} offset ${offset}`;
        // console.log(sql);

        db.all(sql, (err, rows) => {
            // console.log(rows);
            res.render('index', {
                data: rows,
                page,
                pages,
                query: req.query,
                url
            });
        });
    });
})

//  prosess filter //
//     let sql = `select * from paket`
//     if (flag) {
//         sql += ` where ${filter.join(' AND ')}`
//     }
//     db.all(sql, (err, rows) => {
//         // console.log(sql);
//         // console.log(rows);

//         res.render('index', { data: rows })
//     })
// })

app.get('/add', (req, res) => {
    res.render('add')
})


app.post('/add', (req, res) => {
    db.run(`INSERT INTO paket(string,integer,float,date,boolean) VALUES('${req.body.string}','${req.body.integer}','${req.body.float}','${req.body.date}','${req.body.boolean}')`, (err) => {
        res.redirect('/')
    })
})

//cara lain:
// app.get('/edit/:id', (req, res) => {
//     db.all(`select * from paket`, (err, rows) => {
//         let id = req.params.id
//         let index = 0
//         for (i = 0; i < rows.length; i++) {
//             if (rows[i].id == id) {
//                 index = i
//             }
//         }
//         res.render('edit', {
//             item: rows[index]
//         })
//     })
// })

app.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    db.all(`select * from paket where id = '${id}'`, (err, rows) => {
        res.render('edit', {
            item: rows[0],
            id: id
        })
        //console.log(rows[0]);
    })
});


app.post('/edit/:id', (req, res) => {
    let id = req.params.id
    db.run(`update paket set string = '${req.body.string}', integer= '${req.body.integer}', float = '${req.body.float}', date = '${req.body.date}', boolean = '${req.body.boolean}' where id = '${id}'`, (err, rows) => {
        res.redirect('/')
    })
})


app.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    db.run(`delete from paket where id= '${id}'`, (err, rows) => {
        res.redirect('/');
    })
})



app.listen(3000, () => {

    console.log("Web sudah aktif");
})
