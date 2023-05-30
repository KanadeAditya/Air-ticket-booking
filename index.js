const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()

const {connection} = require('./connect')
const {ApiRouter} = require('./controllers/api.routes.js')

const app = express();

app.use(cors());
app.use(express.json());



app.get('/',(req,res)=>{
    res.send(`<h1>Server is running Fine </h1><h2>Port No. :- ${process.env.port}</h2>`)
})

app.use('/api',ApiRouter)

app.listen(process.env.port,async ()=>{
    try {
        console.log("Server is running on "+ process.env.port)
        await connection
        console.log("DB Connected")
    } catch (error) {
        console.log({msg: error})
    }
})