const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: process.env.IMAGE_BUCKET_SECRET_KEY,
  accessKeyId: process.env.IMAGE_BUCKET_KEY,
  region: 'us-east-1'
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'unwasted-images',
    key: function(req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

module.exports = upload;
