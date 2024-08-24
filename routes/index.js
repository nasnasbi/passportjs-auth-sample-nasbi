const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//本来はパスワードはハッシュ化してユーザーネームとセットにしてデータベースに保存するべき。そうするとサインアップが作れるようになる。
const Users = [
    {name: "nasubi", password: "sample"},
]


//初期化
router.use(passport.initialize());

//認証
passport.use(new LocalStrategy((username, password, done) => {
    let isuser = false;
    Users.forEach((user) => {
        //ユーザー名とパスワードで照会
        if (username == user.name && password == user.password) {
            isuser = { username: username, password: password };
        }
    })
    //もし正しいログイン情報ならdone(null, ユーザーの情報)
    //でなければdone(null, false)
    return done(null, isuser);
}));

//ログインするときに一回呼ばれる。
passport.serializeUser((user, done) => {
    console.log(`Serialize with: ${JSON.stringify(user)}`);
    done(null, user);
});
//ユーザーがページにアクセスするたびに呼ばれる。req.userにこれが入る。ユーザーネームにはreq.user.usernameでアクセスできる
passport.deserializeUser((user, done) => {
    console.log(`Deserialize with: ${JSON.stringify({ username: user.username })}`);
    done(null, { username: user.username });
});

//セッションの準備
router.use(passport.session());

// ログイン、ログアウト
// /loginにusrnameとpasswordを入れてpostすれば認証がはじまる。アクセスされると上のLocalstrategyが走る。
router.post('/login',
    passport.authenticate('local',
        {
            failureRedirect: '/login',//間違ったログイン情報のときのリダイレクト
            successRedirect: '/timeline'//正しいときのリダイレクト
        }
    )
);
// logoutにgetすればログアウトされる。
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

//こまごましたやつ
router.get('/', (req, res) => {
    console.log(req.session);
    res.redirect('/login');
});

//なんでこれをここに書いたのか自分でもわからない。
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/timeline');
    } else {
        res.render('login');
    }
})

router.get('/timeline', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('timeline', {username: req.user.username})
    } else {
        res.redirect('/login');
    }
})

module.exports = router;
