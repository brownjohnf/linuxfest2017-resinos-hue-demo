'use strict';

// requires
const
  Promise = require('bluebird'),
  huejay  = require('huejay'),
  rpio    = require('rpio')

// env configs
const hueUsername = process.env.HUE_USERNAME

// pin configs
const
  onOffPin = 7,
  dimPin = 11,
  brightenPin = 13

// discover and connect to bridge
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

// watch pins for input, and then update lights
const watch = (client) => {
  client.groups.getAll()
  .then(groups => {
    rpio.open(onOffPin, rpio.INPUT, rpio.PULL_DOWN)

    rpio.poll(onOffPin, (pin) => {
      for (const group of groups) {
        group.on = !group.on
        client.groups.save(group)
      }
    }, rpio.POLL_HIGH)

    rpio.poll(dimPin, (pin) => {
      console.log('dimming')
      for (const group of groups) {
        let brightness = group.brightness - 50
        if (brightness < 0) brightness = 0
        console.log(brightness)

        group.on = true
        group.brightness = brightness
        group.transitionTime = 0
        client.groups.save(group)
      }
    }, rpio.POLL_HIGH)

    rpio.poll(brightenPin, (pin) => {
      console.log('brightening')
      for (const group of groups) {
        let brightness = group.brightness + 50
        if (brightness > 254) brightness = 254
        console.log(brightness)

        group.on = true
        group.brightness = brightness
        group.transitionTime = 0
        client.groups.save(group)
      }
    }, rpio.POLL_HIGH)

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

