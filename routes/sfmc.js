'use strict';
var request = require('request');
require('dotenv').config();
const getAccessToken = () => {

    return new Promise(function(resolve, reject){
        request({
            url: process.env.authEndpoint,
            method: 'Post',
            json: {
                client_id: process.env.SfmcClientId,
                client_secret: process.env.SfmcClientSecret,
              grant_type: "client_credentials"
            },
          }, (err, response,body) =>{
            
            if (err) return reject(err);
          
                resolve(body);          
        });
    }); 
  };

function getContactAttributes(accessToken){
    
    return new Promise(function(resolve, reject){
         
        request({
            url: process.env.contactAttributesEndpoint,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }, (err, response, body) => {
            if (err) return reject(err);
          
            resolve(body);
          });
    });
}
/*
 * Returns all attribute groups
 */
exports.attributesetdefinitions = function (req, res) {
    getAccessToken()
    .then((body)=>{ 
        getContactAttributes(body.access_token) 
            .then((body)=>{res.status(200).send(body)})  
            .catch((err)=>{res.status(500).end(err)});
    })  
    .catch((err)=>{ res.status(500).end(err)});   
}
