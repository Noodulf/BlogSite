const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
app.use(express.json());

const users=[];

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
            res.send('Logged in successfully');
        }
        else{
            res.send("Invalid password");
        }
    }
    catch(error){
        console.log("Login error: ",error);
    }
        
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})