const mongoose = require("mongoose");

/* title: data.title,
description: data.description,
date: data.date,
location: data.location,
skills: data.skills,*/

let schema = new mongoose.Schema(
    {
        //  give unique id to each job  to be used in the future
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        required: true,
        },
    
    
  },
  { collation: { locale: "en" } }
);

// schema.index({ category: 10, receiverId: 10, senderId: 10}, { unique: true });

module.exports = mongoose.model("trainings", schema);
