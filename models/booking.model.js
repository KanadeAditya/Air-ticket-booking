const mongoose = require('mongoose');
// const {} = require('mongoose')
const {UserModel} = require('../models/users.model.js');
const {FlightModel} = require('../models/flights.model.js');

const bookingschema = mongoose.Schema({
    user : {type: mongoose.SchemaTypes.ObjectId, ref: UserModel },
	flight : { type: mongoose.SchemaTypes.ObjectId, ref: FlightModel }
})

const  BookingModel = mongoose.model('booking',bookingschema);

module.exports = {BookingModel}