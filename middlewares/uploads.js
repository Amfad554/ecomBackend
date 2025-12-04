const multer = require('multer');
//stores file in memory as buffer
const storage = multer.memoryStorage();

//gain acces to the stored file
const uploads = multer({ storage});

//export the middleware to allow stored files accessible for pushing to database 
module.exports = uploads;