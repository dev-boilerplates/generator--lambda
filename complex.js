'use strict';
const { google } = require('googleapis');
const axios = require('axios')
const AWS = require('aws-sdk')
const ElasticTranscoder = new AWS.ElasticTranscoder({ apiVersion: '2012-09-25', region: 'eu-west-1' })
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
const CDI_ENDPOINT = "https://wn8uwcict4.execute-api.eu-west-2.amazonaws.com/latest"
const KEY = {
    type: "service_account",
    project_id: "content-delivery-interface",
    private_key_id: "01b79e06f491e4f4cae90ee7e231f1d932efc164",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvaHY5rxxWM6Ja\ntjPYt5plnMd/EOHJXdSZoNEbuTdMdq8jFLQZmS1ZQy91IRa217kysUnOza+8TFDZ\n7zDuYb7XNsgg8Jnzhd1FF1kGTy2v1UCyaXEyYOyR72vBF0Czfw6dUmTfsaxIsHW8\n7JozJxAy/i6OUUdMYh3lPhtoNb+52JhR8B68OpmPog+Kq3bSpQccV9k9NL2qd/ma\naPcVf8z+rz9K9wgtEGjHELXkLPNSrHlU8i0Vv0L7uzpV5y6USR4kEnGkTm4UJtzZ\nZeKMKEY8n4ssJAh4mAZI+Ibpvcx9mJQYOcitnAm9VMzluPEIFXH4zFLDtJeCPCt4\nLTUkEnTHAgMBAAECggEAEN5UZEa9TGLpzZxxDvnVLMlve/5FIGbYH7AR+/8LXNyb\nCh4fFckfzdJCuZplg07qnf/jr7IjINIcAmFYzMv0nODFTTmmLH+moFLW+l7Z72ts\nLdwrCSO+DGjAbZDNZZWl86YtUj/VaCYkJHeCesHacnT0SDZzy1oyMs4Ot65Xkkkj\n1uWzBVVsr9rwlwMavdfnipirszY4kAbIS0lyU0SY0iJMXa8lwXdXxr9AwzVglpJZ\nd/DhIE25cKbJ7TGW3p4+nvMCOPb2E4spORtqt0cgUPubblz5cTnI/CZL6A5HY3BZ\n1z3UCxyB2ynw3OV09ut2YsStAwJ2u+d/pvamvKit+QKBgQDUZ9QPjh8ByakcWo6P\n+TIaNJiRn3iB3fWLdf7K9u0gRbhU9dGoZxn7vTCK6Mm6vwSxhN406Nm96Zia/oLp\nccTY9NhhJ0kHyOKOpwjkwSCINshM3yZcz7eaUJ967scu9fulgFAzKwtdoUXgTkVR\nOZ18qebx39ZuxnZGL8yAP+E/rwKBgQDTaLeCwnMqibrI/KlKU7ShiXuOYP46Xf31\nlTQQRDrQB/vKJJXuZs8eDTm7YiXAsUTfQiRLo7uhxeee1Zf5qBt2yt9v15LAWH+4\nTW4UKogNoZjBPJWxvo7PXfHAO3VeW9D0DYmhfrl+2nJmBzOIjqjPa/oAX08w/AXE\nM0OTJRWKaQKBgAjbj5daeOaNL1U0XY+Zd8JqARbJjK/1vqCjOg3iwD7BSY+ZdLXO\nHuJFoHmafZchEiQJA283aqUl0axdAr6TdP8LLt7WUZBWi0QhqRhJCX9EsZOrFqF2\nNBTmWdA5lurZbTYYpL+NgvrTl+NjwDZD7dJeD3h0ui+CbTo+EgwjHdSXAoGBAKQZ\nebDXLTwMst9GOEZImUJ2jGDlaxF1WichzMr/m0NVnx22rmbiiMzD6VdJhRKAx3wh\nRDkue/vDudmx5IjW85KPQUb4Z6JET8eI2vRuWzNxhzgfxfa1evb97iSQQreev6Bh\nTb78thIAkKIf3uGWEvUG1IUrdjYIupUkUcTLGWBZAoGBAKaUD4j+lW+LNFYF5oe3\nXEBqzD4965asQJrhi9zNDRFbySKXdvU+bmyHy5itoXUtf2kyA0FxxpypTChQTAn5\npqVSJEqR5rcpoGSDYVXViHzGRVqI4Rtj4X7hpQz+0Nfw8xcEUNCnnMc+Uc6Ceyor\nAxDv1I5+BCuBVnzytckceUZL\n-----END PRIVATE KEY-----\n",
    client_email: "content-delivery-interface@appspot.gserviceaccount.com",
    client_id: "108228019251892427715",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://accounts.google.com/o/oauth2/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/content-delivery-interface%40appspot.gserviceaccount.com"
}
const jwtClient = new google.auth.JWT(
    KEY.client_email, 
    null, 
    KEY.private_key,
    ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets'],
    null
)
AWS.config.logger = console;

function getSheetPipeline(job) {
    return new Promise((resolve, reject) => {
        jwtClient.authorize((err, tokens) => {
            google.sheets('v4').spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: process.env.SPREADSHEET_ID,
                range: 'Sheet1!A2:C'
            }, (err, result) => { if(!err) resolve(result.data.values.filter(project => project[0] === job).pop()) })
        })    
    })
}
function getPipeline(job) {
    return new Promise((resolve, reject) => {
        axios.get(`${CDI_ENDPOINT}/firebase`)
        .then(response => {            
            let match = response.data.filter(project => {
                if(job.toString() === project.bucket.split("-")[0]) return { pipeline: project.pipeline, bucket: project.bucket }
            })
            let results = (match.length > 0) ? { job, pipeline: match[0].pipeline, bucket: match[0].bucket } : null
            resolve(results)
        }).catch(err => {
            console.log(err)
            reject("api fail")
        })  
    })
}
function handleUpload(file) {
    if(file.type === 'video') {
        console.log('New video has been uploaded:', file);
        if(file.final) copyFile(file);
        else {
            ensureOverride(file)
            .then(() => {
                console.log("REMOVED PREVIOUS VERSION - NOW TRANSCODING")
                transcoder(file)
            })
            .catch(() => {
                console.log("FILE DOESNT EXIST - GET ON WITH TRANSCODING")
                transcoder(file)
            })
        }
    } else {
        console.log('New ZIP has been uploaded:', file);
        copyFile(file);
    }
}
function asThumbnail(name) {
    return `${name}_00001.png`
}
function ensureOverride(file) {
    return new Promise((resolve, reject) => {
        doesMp4Exist(file.bucket, file.output)
        .then(response => {            
            if(response.action === "delete") deleteFileAndThumb(file.bucket, file.output, asThumbnail(file.thumb)).then(() => resolve());
        }).catch(response => {
            if(response.action === "transcode") reject();
        })
    })
}
function doesMp4Exist(Bucket, Key) {
    return new Promise((resolve, reject) => {
        s3.headObject({ Bucket, Key }, (err, data) => {
            if(data === null) reject({ action:"transcode" }); 
            else resolve({ action: "delete" }); 
        })
    })
}
function ifThumbExistThenKill(Bucket, Key) {
    return new Promise((resolve, reject) => {
        s3.headObject({ Bucket, Key }, (err, data) => {
            if(data === null) resolve()
            else {
                console.log('HAS MATCHING THUMBNAIL - attempting to remove it')
                 s3.deleteObject({ Bucket, Key }, (err, data) => {
                    if(err) reject(err);
                    else resolve()
                 })
            } 
        })
    })
}
function deleteFileAndThumb(Bucket, Key, thumb) {
    return new Promise((resolve, reject) => {
        s3.deleteObject({ Bucket, Key }, (err, data) => {
            if(err) reject(err);
            ifThumbExistThenKill(Bucket, thumb).then(() => resolve())
        })
    })
}
function formatFile(filename) {
    let state = {
        input: filename,
        output: null,        
        name: filename,
        thumb: null,
        final: false,
        job: null,
        bucket: null,                
        PIPELINE: null,
        type: filename.includes('.mp4') ? 'video' : 'zip'
    }
    if(filename.includes("FINAL_DELIVERY--")) {
        state.name = filename.replace("FINAL_DELIVERY--", "")
        state.final = true
    }  
    let target = getOutputName(state)
    return { ...state, ...target }
}
function copyFile(file) {
    if(file.final) notifyDelivery(file, "processing")
    s3.copyObject({ 
        CopySource: 'cdi-uploads/' + file.input,
        Bucket: file.bucket,
        Key: file.output,
        ACL: "public-read",
        ContentType: "application/zip",
        Metadata: { 'Content-Type': "application/zip" },
        MetadataDirective: "REPLACE"
    }, (copyErr, copyData) => {
        if(!copyErr) {
            console.log('Copied ' + file.input + ' to ' + file.output);
            if(file.final) notifyDelivery(file, "complete")
        }
    })
}
function notifyDelivery(file, status) {
    axios.post(`${CDI_ENDPOINT}/firebase/upload`, { job: file.job, name: file.name, status })
        .then(res => console.log("resposne",res.data))
        .catch(error => console.log("errro", error.data))
}
function transcoder(file) {
    if(file.output) {
        ElasticTranscoder.createJob({
            PipelineId: file.PIPELINE,
            Input: {
                Key: file.input,
                FrameRate: 'auto',
                Resolution: 'auto',
                AspectRatio: 'auto',
                Interlaced: 'auto',
                Container: 'auto'
            },
            Outputs: [{
                Key: file.output,
                ThumbnailPattern: `${file.thumb}_{count}`,
                PresetId: process.env.PIPELINE_PRESET,
                Rotate: 'auto'
            }]
        }, (err, data) => if(err) console.log('Something went wrong transcoding', err));
    } else {
        console.log("The filename provided doesnt match our CDI criterior");
        return null
    }
}

function getOutputName(file){
    // rules -- {144}_{L01_Hospital}_{CAM01_v01-01}.mp4
    let filetype = (file.type === 'video') ? '.mp4' : '.zip'
    let parts = file.name.replace(filetype,'').split('_')
    let destination = (file.final) ? "FINAL_DELIVERY" : "DELIVERY"
    if(parts.length === 5) {
        let job = parts.shift(),
            version = parts.pop(),
            file = parts.pop(),
            folder = parts.join('_')
        return {
            output: `${destination}/${folder}/${folder}_${file}_${version}${filetype}`,
            thumb: `${destination}/${folder}/${folder}_${file}_${version}`,
            job
        }
    } else return null
}
/**
 * LAMBDA HANDLER
 */
exports.handler = (event, context, callback) => {    
    let file = (event.hasOwnProperty('Records')) ? formatFile(event.Records[0].s3.object.key) : formatFile('150_L01_Location_CAM01_v01-01.mp4')
    if(file) {
        getPipeline(file.job)
        .then(data => {
            if(data != null) {            
                file.PIPELINE = data.pipeline//data[1]
                file.bucket = data.bucket//data[2]            
                handleUpload(file) // // notifyDelivery(file, "complete")
            } else console.log('file has not been processed because the PIPELINE has not been added to the Google Sheet Lookup Table')
        }).catch(console.log)
    } else console.log("FAIL at file format - the filename does not meet our criteria")
};