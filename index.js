const express = require('express');
const app = express();
const session = require('express-session');

//テンプレートエンジン
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'thisisseacret',
    resave: true,
    saveUninitialized: false,
    //本番環境ではsecureをtrueにする。Https接続のときしか認証できなくなる。仕様は詳しくは知らない。
    cookie: { maxAge: 1000 * 60 * 30 }// , secure: true
}));

// routers/index.jsのルーターを使う。ルーターはpassport.jsを設定してある。
//app.use('ここを変えるとうまく動かなくなるかもしれない。要編集', require('./routes/index'));
app.use('/', require('./routes/index'));

// 静的ファイルにもこれで制限がかけられる
app.use('/public', (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}, express.static('public'));


// 投稿
app.get("/post", async (req, res) => {
    if (req.isAuthenticated()) {
        date = new Date()
        console.log(`${req.user.username}が${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}にポスト:\n${req.query.msg}`);
        res.status(200).send("Success")
    } else {
        res.status(403).send("You must login!");
    }
});

//未認証時のリダイレクト
app.use("*", (req, res) => {
    if (req.isAuthenticated()) {
        res.status(404).redirect("/timeline")
    } else {
        res.status(403).redirect("/login");
    }
})



// 3000ポートでリッスン
app.listen(3000, console.log('Server listening port 3000...'));