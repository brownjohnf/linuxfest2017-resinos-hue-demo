'use strict';

// requires
const
  _       = require('lodash'),
  Promise = require('bluebird'),
  huejay  = require('huejay'),
  rpio    = require('rpio')

// env configs
const hueUsername = process.env.HUE_USERNAME

const connect = () => {
  return huejay.discover()
  .then(bridges => {
    if (bridges.length < 1) {
      throw new Error('Found no bridges!')
    }

    console.log(`Hue Bridge: ID: ${bridges[0].id}, IP: ${bridges[0].ip}`);
    const client = new huejay.Client({
      host: bridges[0].ip,
      username: hueUsername
    })

    return client.bridge.isAuthenticated()
    .then(() => {
      console.log('authenticated')
      return client
    })
  })
}

const run = () => {
  connect()
  .catch(err => {
    console.log(`An error occurred: ${err.message}`)
    console.log(err.stack)
    process.exit(1)
  })
}

run()

