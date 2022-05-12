'use strict';
var util = require('util');
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
let setarService = require('./setar');
let bitly = require('./bitly');
var request = require('request');
var logger = require('./logger');
exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    logger.info(`edit method:${JSON.stringify(req.body)}`);
    res.status(200).send('Edit');

};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logger.info(`save method:${JSON.stringify(req.body)}`);
    logData(req);

    res.status(200).send('Save')

};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = async function(req, res) {
    var jwt = req.body.jwt;
    // var jwt = req.body.toString("utf8")
    request({
            url: 'https://devsutd-requestbin.herokuapp.com/tad0sutd',
            method: "POST",
            json: jwt,
        },
        function(error, response, body) {
            if (!error) {
                console.log(body);
            }
        }
    );

    JWT(jwt, process.env.jwtSecret, async(err, decoded) => {
        if (err) {
            logger.info(`edit method:${JSON.stringify(err)}`);
            return res.status(200).json({ branchResult: "notsent" });
        }
        try {
            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

                var decodedArgs = decoded.inArguments[0];
                logger.info(`edit method:${JSON.stringify(decodedArgs)}`);
                var message = decodedArgs.message;
                var devices = getDevicesList(decodedArgs.mobileFields);
                if (decodedArgs.long_url && decodedArgs.long_url.length > 0) {
                    logger.info(`trying to shorten url :${decodedArgs.long_url}`);
                    const bitlyResponse = await bitly.shorten(decodedArgs.long_url);
                    if (bitlyResponse == undefined) {
                        logger.info(`Invalid short url, we will skip this send`);
                        return res.status(200).json({ branchResult: "notsent" });
                    }
                    console.log(bitlyResponse);
                    logger.info(`bitly :${bitlyResponse}`);
                    message = message.replace("%%long_url%%", bitlyResponse);
                    logger.info(`MESSAGE :${JSON.stringify(message)}`);
                }

                for (let index = 0; index < devices.length; index++) {
                    const msgBody = {
                        "sid": "setar-salesforce",
                        "from": decodedArgs.from,
                        "to": devices[index],
                        "text": message
                    };
                    setarService.sendMessage(msgBody).then((sentResponse) => {
                        if (sentResponse.statusCode == 200) {
                            logger.info(`message sent: ${JSON.stringify(msgBody)}`);
                            return res.status(200).json({ branchResult: "sent" });
                        } else {
                            logger.info(`message sent: ${JSON.stringify(msgBody)}`);
                            return res.status(200).json({ branchResult: "notsent" });
                        }
                    });
                }

            } else {
                logger.error(`Invalid payload: ${JSON.stringify(decoded)}`);
                return res.status(200).json({ branchResult: "notsent" });
            }
        } catch (generalError) {
            logger.error(`Error on activity controller${JSON.stringify(generalError)}`);
            return res.status(200).json({ branchResult: "notsent" });
        }

    });
};

function getDevicesList(items) {
    const arr = [];
    for (var index = 0; index < items.length; index++) {
        const element = items[index];
        arr.push(element.value);
    }
    return arr;
}


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    logger.info(`publish method: ${JSON.stringify(req.body)}`);
    res.status(200).send('Publish')
};
/*
 * POST Handler for /stop/ route of Activity.
 */
exports.stop = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    logger.info(`stop method: ${JSON.stringify(req.body)}`);
    res.status(200).send('stop')
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logger.info(`validate method: ${JSON.stringify(req.body)}`);
    logData(req);
    res.status(200).send('Validate')
};