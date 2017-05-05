'use strict';

// requires
const
  _          = require('lodash'),
  Promise    = require('bluebird'),
  huejay     = require('huejay'),
  rpio        = require('rpio'),
  util       = require('util')

// env configs
const hueUsername = process.env.HUE_USERNAME

// pin configs
const onOffPin = 7

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

const watch = (client) => {
  client.groups.getAll()
  .then(groups => {
    rpio.open(onOffPin, rpio.INPUT, rpio.PULL_DOWN)

    rpio.poll(onOffPin, (pin) => {
      if (!rpio.read(pin)) return

      for (const group of groups) {
        group.on = !group.on
        client.groups.save(group)
      }
    })

    console.log('ready')
  })
}

const run = () => {
  connect()
  .then(watch)
  .catch(err => {
    console.log(`An error occurred: ${err.message}`)
    console.log(err.stack)
    process.exit(1)
  })
}

run()

