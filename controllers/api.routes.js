const express = require('express');
const mongoose = require('mongoose');
const {UserModel} = require('../models/users.model.js');
const {FlightModel} = require('../models/flights.model.js');
const {BookingModel} = require('../models/booking.model.js');
const {authenticator} = require('../middlewares/authenticate.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const ApiRouter = express.Router();


ApiRouter.get('/',(req,res)=>{
    res.send(`<h1>ApiRouter is running Fine </h1><h2>Port No. :- ${process.env.port}</h2>`);
})

ApiRouter.post('/register',async (req,res)=>{
    let {email,name,password} = req.body ; 
    try {
        if(!email || !name || !password){
            res.status(400).send({msg:"Please Provide all the details"})
        }else{
            let ifexist = await UserModel.find({email});
            if(ifexist.length){
                res.status(403).send({msg:"User Already exists"})
            }else{
                bcrypt.hash(password, 8, async (err, hash)=>{
                    // Store hash in your password DB.
                    if(err){
                        console.log({msg : err})
                        res.send({msg : err.message})
                    }else{
                        let user = new UserModel({email,name,password:hash});
                        await user.save();
                        res.status(201).send({msg:"User Registered Successfully",user})
                    }
                });
            }

        }
    } catch (error) {
        res.status(500).send({msg:error.message})
    }

})

ApiRouter.post('/login',async (req,res)=>{
    let {email,password} = req.body ; 
    try {
        if(!email || !password){
            res.status(400).send({msg:"Please Provide all the details"})
        }else{
            let ifexist = await UserModel.find({email});
            if(ifexist.length){
                bcrypt.compare(password, ifexist[0].password, (err, result)=>{
                    // result == true
                    if(err){
                        console.log({msg : err})
                        res.status(400).send({msg : err.message})
                    }else{
                        if(result){
                            let token = jwt.sign({ userID : ifexist[0]._id , email: ifexist[0].email }, process.env.secretkey, { expiresIn: '1h' });
                            res.status(201).send({msg:"User Logged in",token})
                        }else{
                            res.status(400).send({msg:"Invalid Credentials , Incorret password"})
                        }
                    }
                });
            }else{
                res.status(400).send({msg:"Invalid Credentials , Please provide correct credentials"})
            }

        }
    } catch (error) {
        res.status(500).send({msg:error.message})
    }

})

ApiRouter.post('/flights',async (req,res)=>{
    let {airline, flightNo, departure, arrival, departureTime, arrivalTime, seats, price} = req.body
    try {
        if(!airline || !flightNo || !departure || !arrival || !departureTime || !arrivalTime || !seats || !price ){
            res.status(400).send({msg:"Please Provide all the details"})
        }else{
            // res.send(req.body)
            let flight = new FlightModel({airline, flightNo, departure, arrival, departureTime:new Date(departureTime), arrivalTime:new Date(arrivalTime), seats, price});
            await flight.save();
            res.status(201).send({msg:"Flight added to DataBase",flight})
    
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
    
})

ApiRouter.get('/flights',async(req,res)=>{
    try {
        let allflights = await FlightModel.find();
        res.status(200).send(allflights)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})
ApiRouter.get('/flights/:id',async(req,res)=>{
    let {id} = req.params
    try {
        // if(!id ){
        //     res.status(400).send({msg:"Please Provide id"})
        // }else{
            let flight= await FlightModel.findById(id);
            res.status(200).send(flight)
        // }
       
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

ApiRouter.patch('/flights/:id',async(req,res)=>{
    let {id} = req.params
    try {
        // if(!id ){
        //     res.status(400).send({msg:"Please Provide id"})
        // }else{
            let flight= await FlightModel.findByIdAndUpdate(id,req.body,{returnDocument:'after'});
            res.status(204).send({msg : "Flight info has been updated",flight})
        // }
       
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

ApiRouter.delete('/flights/:id',async(req,res)=>{
    let {id} = req.params
    try {
        // if(!id ){
        //     res.status(400).send({msg:"Please Provide id"})
        // }else{
            await FlightModel.findByIdAndDelete(id);
            res.status(202).send({msg : "Flight has been deleted"})
        // }
       
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

ApiRouter.post('/booking',authenticator,async (req,res)=>{
    let {userID , flight  } = req.body;
    try {
        // res.send(req.body)
        if(!userID || !flight){
            res.status(400).send({msg:"Please Provide all details"})
        }else{
            let booking = new BookingModel({user:userID , flight});
            await booking.save();
            
            res.status(201).send({msg:"Booking Has been Created",booking});

        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

ApiRouter.get('/dashboard',authenticator,async (req,res)=>{
    let {userID } = req.body;
    try {
        let data = await BookingModel.aggregate([
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$user', {
                      '$toObjectId': userID
                    }
                  ]
                }
              }
            }, {
              '$lookup': {
                'from': 'flights', 
                'localField': 'flight', 
                'foreignField': '_id', 
                'as': 'result'
              }
            }, {
              '$unwind': {
                'path': '$result'
              }
            }, {
              '$group': {
                '_id': '$user', 
                'count': {
                  '$count': {}
                }, 
                'flights': {
                  '$push': '$result'
                }
              }
            }
          ])

        res.status(200).send(data);
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})


module.exports = {ApiRouter}