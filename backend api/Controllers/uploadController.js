const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v5: uuidv5 } = require("uuid");
const { promisify } = require("util");
const ResumeParser = require('resume-parser');

const pipeline = promisify(require("stream").pipeline);

const postResume = (req, res) => {
    console.log(req.file);
    const { file } = req;
    console.log(file.originalname.split('.')[1]);
    if (file.originalname.split('.')[1] != "pdf") {
      console.log("Invalid format");
    res.status(400).json({
      message: "Invalid format",
    });
  } else {
    const filename = `${uuidv5( file.originalname, uuidv5.DNS )}${".pdf"}`;
    console.log(filename);
    pipeline(
      file.buffer,
      fs.createWriteStream(`${__dirname}/../public/resume/${filename}`)
    )
        .then(() => {
        //    parse resume 
            console.log("File uploaded successfully");
            res.send({
                message: "File uploaded successfully",
    
                url: `/host/resume/${filename}`,
            })
                        
        })
        
      
        .catch((err) => {
            console.log(err);
        res.status(400).json({
          message: "Error while uploading",
        });
      });
  }
}

const postProfile = (req, res) => {
    const { file } = req;
    if (
        file.detectedFileExtension != ".jpg" &&
        file.detectedFileExtension != ".png"
    ) {
        res.status(400).json({
            message: "Invalid format",
        });
    } else {
        const filename = `${uuidv5( file.originalname, uuidv5.DNS )}${file.detectedFileExtension}`;

        pipeline(
            file.stream,
            fs.createWriteStream(`${__dirname}/../public/profile/${filename}`)
        )
            .then(() => {
                res.send({
                    message: "Profile image uploaded successfully",
                    url: `/host/profile/${filename}`,
                });
            })
            .catch((err) => {
                res.status(400).json({
                    message: "Error while uploading",
                });
            });
    }
}


const Upload_Controller = {
    postResume,
    postProfile
}
module.exports = Upload_Controller;
