'use strict';
var AWS = require('aws-sdk')
AWS.config.logger = console; // assign logs to CloudWatch

exports.handler = (event, context, callback) => {
    // if in use with s3 Triggers
    let fileName = (event.Records.length > 0) ? event.Records[0].s3.object.key : null
    context.done(null, { status: 200, message: "Exit Function" })
};