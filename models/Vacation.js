var mongoose = require('mongoose');

var vacationSchema = new mongoose.Schema({
  location: String,
  duration: String, 
  cost: Number,
  date: Date
  
//    incentive: String,
//    paymentType: String,
//
//    numberOfStudies: Number,
//    durationOfStudy: String,
//    studyType: String,
//
//    icon: String,
//
//    numberOfPeople: {type: Number, default: 10, required: true },
//    waitlistNumber: {type: Number, default: 2, required: true },
//
//    location: String,
//
//    startDate: Date,
//    endDate: Date,
//
//    surveyLink: String,
//
//    acceptedParticipants: [{ ref: 'User', type: Schema.ObjectId }],
//    waitlistParticipants: [{ ref: 'User', type: Schema.ObjectId }]

});

module.exports = mongoose.model('Vacation', vacationSchema);
