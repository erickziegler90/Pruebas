var request = require('request');
var logger = require('./logger');
require('dotenv').config();
exports.sendMessage = (json) => {
    console.log("received", json);
    return new Promise(function(resolve, reject) {
        request({
            url: process.env.setarEndpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.setarAccessToken}`,
            },
            json: json,
        }, (err, response, body) => {
            if (err) {
                logger.error(`error sending email ${err}`);
                return reject(err);
            }
            logger.info(`SMS api response ${JSON.stringify(response.body)}`);
            return resolve(response);
        });
    });
}