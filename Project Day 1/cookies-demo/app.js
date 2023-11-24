/* Cookies => 
1. It is part of of client side Storage
2. It store the data in the form of key:value pair
3. It is not secure
4. Cookies are send by the server to the client
5. When the request is send to the server then along with the request cookies are also send to the server for better performance */

const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("<h1>Home Route</h1>");
})

// cookies Bhejna
app.get("/setcookies",(req,res)=>{
    res.cookie('mode','dark');
    res.cookie('name','Amit Kumar');
    res.cookie('location','Mathura');

    res.send('Cookies set Hogi');
})

// Access the cookies
app.get("/allcookies",(req,res)=>{
    let {name,mode,location} = req.cookies;
    console.log(req.cookies);
    console.log(`${name} lives in ${location} and like ${mode} mode`);
    res.send(req.cookies);
})


app.listen(8080,()=>{
    console.log("Server connected at PORT 8080");
})