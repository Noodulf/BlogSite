const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());

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
    res.send(`Welcome ${payload.name}!`);
    let password = await bcrypt.hash(payload.password, 10);
    users.push({name: payload.name, password: password});
    console.log(users);
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