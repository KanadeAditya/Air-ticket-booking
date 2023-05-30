const mongoose = require('mongoose');

const flightschema = mongoose.Schema({
    airline : {type : String , required : true},
    flightNo : {type : String , required : true},
    departure : {type : String , required : true},
    arrival : {type : String , required : true},
    departureTime : {type : Date , required : true},
    arrivalTime : {type : Date , required : true},
    seats : {type : Number , required : true},
    price : {type : Number , required : true}
})

// {
//     _id: ObjectId,
//     airline: String,
//     flightNo: String,
//     departure: String,
//     arrival: String,
//     : Date,
//     : Date,
//     seats: Number,
//     price: Number
//   }
const  FlightModel = mongoose.model('flight',flightschema);

module.exports = {FlightModel}