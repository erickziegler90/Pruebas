var request = require('request');
var logger = require('./logger');
require('dotenv').config();

// eslint-disable-next-line consistent-return
exports.shorten = (long_url) => {
    console.log(long_url);
    return new Promise((resolve, reject) => {
        request({
            'method': 'POST',
            'url': 'https://api-ssl.bitly.com/v4/shorten',
            'headers': {
                'Authorization': `Bearer ${process.env.bitly_accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "long_url": long_url,
                "domain": "bit.ly",
                "group_guid": process.env.bitly_groupId
            })
        }, function(error, response) {
            if (error) {
                logger.error(`error on bitly api call ${error}`);
                return reject(error);
            }
            if (response.statusCode != 200) {
                logger.error(`error on bitly api call ${response.body}`);
                return reject(error);
            }

            logger.info(`bitly api call response:  ${response.body}`);
            var bitlyObject = JSON.parse(response.body);
            return resolve(bitlyObject.link);
        });
    });


};