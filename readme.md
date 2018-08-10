## AWS Lambda Function

`Package.json` is setup to use the `index.js` as the handler file for **Lambda**

GLOBAL variables that are set in the AWS Dashboard are accessed by `process.env.GLOBAL_VAR`

* **Start** `npm install`



**index.js**

```
var AWS = require('aws-sdk'),
    transcoder = new AWS.ElasticTranscoder({
        apiVersion: '2012-09-25',
        region: 'eu-west-1'
    });   
AWS.config.logger = console;

exports.handler = (event, context, callback) => {
	// run app
}
```

By using the `AWS sdk`, you access all of the optimised command-line actions.

See  `complex.js` for full woring example.



## API or ARN | API Gateway

If API Gateway is not used - then no URL is created, and Fn is not accessible outside of AWS services. 

Once an API is setup, then if the function needs to **respond** then the handler `context` comes into to use.

* `response` : `context.done(null, { status: 200 })`
* `error` : `context.done({ status: 400 })`

### Expose as public API

In the API Gateway, add POST AND OPTIONS methods 

`Request` - select Lambda Function (_do not use proxy integration_)
`Response` - Edit **HEADER MAPPINGS** and add the following:

```
Access-Control-Allow-Methods 	: "*",
Access-Control-Allow-Origin 	: "*",
Access-Control-Expose-Headers	: "*",
Access-Control-Allow-Headers 	: "*"
```



## AWS Logs

In the Lambda app use `AWS.config.logger = console;` to output to the AWS event logger. Where you can find in the Logs category within **CloudWatch**



## Deployment

`npm run package`

Manually upload the **.zip** after running `~/ zip -r lambda.zip *` to the specific AWS Lambda Function dashboard.

For automative deployments, use `claudia.js` or `apex up` as choice alternatives.