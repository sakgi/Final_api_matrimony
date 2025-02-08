const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: 'dsldqwbze', 
        api_key: '177753248943978', 
        api_secret: '3DldiErA8BO5kF6ENTaHeEwUEzE' 
});

module.exports = cloudinary;
