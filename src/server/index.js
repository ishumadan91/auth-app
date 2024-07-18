import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secret = "844104B22B685402C7198D233B16B150301E41A4929B0747D7E708ECAC0D030A";
// const brcypt=  require("brcypt")

const app = express();
const port = 3000

const users = [ {id: "1", name: "abc", password: "$2a$10$SNf.i99WTn3WUorGJ//98uCwZNQruGTtejcm7vFtgT2GfA3pIPRoa"} ]

const refreshTokens = [];

app.use((req, res, next) => {
    const { headers: { cookie } } = req;
    if (cookie) {
        const values = cookie.split(';').reduce((res, item) => {
            const data = item.trim().split('=');
            return { ...res, [data[0]]: data[1] };
        }, {});
        res.locals.cookie = values;
    }
    else res.locals.cookie = {};
    console.log(res.locals);
    next();
});
app.use(express.json())    // <==== parse request body as JSON
app.use(cookieParser());
app.listen(port, () => {
    console.log("Listening to port: " + port);
})

app.post("/api/generatePassword/:password", (req,res) => {
    console.log(req.params.password)
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            // Handle error
            return;
        }
        bcrypt.hash(req.params.password, salt, (err, hash) => {
            console.log(err)
            console.log(hash);
            res.send(hash);
        });
    });
});

app.post("/api/login", (req, res) => {
    const {user, password} = req.body;
    const foundUser = users.find(({id}) => id == user)
    if(!foundUser) {
        res.statusCode = 403;
        res.send("");
    }
    bcrypt.compare(password, foundUser.password).then((doesMatch) => {
        if(doesMatch) {
            var token = jwt.sign({ user }, secret, {expiresIn: 60});
            res.cookie("token", token, {httpOnly: true,})
            res.send("")
        } else {
            res.statusCode = 403;
            res.send("")
        }
    })
})

app.post("/api/auth", (req, res) => {
    const {token} = res.locals.cookie;
    try {
        jwt.verify(token, secret);
    } catch(e) {
        res.statusCode = 403;
        res.send("")
    }
    res.send("Auth Ok")
})

app.get("/", (req,res) => {
    res.sendFile('client/index.html', { root: './src/' })
})