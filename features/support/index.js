'use strict'

const composerSteps = require('composer-cucumber-steps')
const cucumber = require('cucumber')

module.exports = function () {
    composerSteps.call(this)
}

if (cucumber.defineSupportCode) {
    cucumber.defineSupportCode((context) => {
        module.exports.call(context)
    })
}

