const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const upload = multer({
    fileFilter: function (req, file, cb) {
    
        // Set the filetypes, it is optional
        var filetypes = /pdf/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }
  
    // mypic is the name of file attribute
});

const Upload_Controller = require("../Controllers/uploadController");

router.post("/resume", upload.single("file"), Upload_Controller.postResume);
router.post("/profile", upload.single("file"), Upload_Controller.postProfile);

module.exports = router;