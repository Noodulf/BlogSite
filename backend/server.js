const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'blogsite'
})
app.use(express.json());
//app.use(bodyparser.json());

const users=[];
const posts =[
    {
        name: 'first',
        post: 'This is my first post'
    },
    {
        name: 'second',
        post: 'This is the second user'
    },
    {
        name: 'third',
        post: 'This is the third user'
    }
]

async function tokenAuthenticate(req, res, next){
    const token = req.headers["authorization"].split(' ')[1];
    if(!token) return res.status(401).send("No token provided");
    try{
        jwt.verify(token, 'Noodulf', (err, user)=>{
            if(err) return res.status(401).send("Invalid token");
            req.user = user;
            next();
        })
    }
    catch(error){
        console.log("Some token error: ",error);
    }
}

app.post('/signup', async (req, res)=>{
    let payload = req.body;
    console.log(payload);
    let password = await bcrypt.hash(payload.password, 10);
    users.push({name: payload.name, password: password});
    console.log(users);
    const query= "insert into users (username, password_hash) values (?, ?)";
    let values = [payload.name, password];
    db.query(query , values, (err, results)=>{
        if(err) throw err;
        console.log("Inserted into database", results);
    })
})

app.post('/login', async (req, res)=>{
    let user= users.find(user=> user.name==req.body.name);
    if (!user) return res.status(400).send('User not found');
    try{

        if(await bcrypt.compare(req.body.password, user.password)){
            const token = jwt.sign(user, 'Noodulf');
            res.json(
                {
                    token: token,
                    message: "Logged in successfully"
                }
            )

        }
        else{
            res.send("Invalid password");
        }
    }
    catch(error){
        console.log("Login error: ",error);
    }
        
})

app.get('/posts', tokenAuthenticate, (req, res)=>{
    const post= posts.find(post=>post.name==req.user.name);
    res.send(post);
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})