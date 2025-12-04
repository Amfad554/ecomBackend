const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function generateToken(user) {
  const { firstname, lastname, email, phone, image, address, role, id } = user;

  if (!firstname) {
    console.log("Missing firstname feild!");
  }
  if (!lastname) {
    console.log("Missing lastname feild!");
  }
  if (!email) {
    console.log(" message: Missing email feild!");
  }
  if (!phone) {
    console.log("Missing phone feild!");
  }
  if (!address) {
    console.log("Missing address feild!");
  }
  if (!image) {
    console.log("missing image field");

  }
  if(!id){
    console.log("missing id field");
  }
  const payload = {
    firstname,
    lastname,
    email,
    phone,
    address,
    image,
    role, 
    userid : id,
    
  };

  const option = {
    expiresIn: "2h",
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, option);
}

module.exports = generateToken;