const AWS=require("aws-sdk");

AWS.config.update({ region:"ap-southeast-2"});

const s3=new AWS.S3();

const S3_BUCKET="bucketsaz";

module.exports={s3,S3_BUCKET};