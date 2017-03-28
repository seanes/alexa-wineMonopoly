'use strict';
var Alexa = require("alexa-sdk");
const vinmonopolet = require('vinmonopolet');
const Facet = require('vinmonopolet').Facet;
var lastProduct = null

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.dynamoDBTableName = 'WINE_MONOPOLY_TABLE';
  alexa.execute();
};

var handlers = {
  'LaunchRequest': function () {
    this.emit('SayHello');
  },
  'randomWine': function () {
    this.emit(":ask", "Would you like red, white or rosé?")
  },
  'randomWineAnswer': function () {
    var wineType = this.event.request.intent.slots.winetype.value

    var wineTypesMap = {
      'red': Facet.Category.RED_WINE,
      'white': Facet.Category.WHITE_WINE,
      'rose': Facet.Category.ROSE_WINE
    }

    vinmonopolet.getProducts({facet: wineTypesMap[wineType]}).then(response => {

      var randomIndex = randomNumberWithin(response.products.length)

      var title = wineType + "wine suggestion"
      lastProduct = response.products[randomIndex]
      this.attributes["lastProduct"] = lastProduct
      var answer = 'We recommend ' + lastProduct.name + " for wine type " + wineType + ". Would you like to know more about this product?"

      this.emit(':askWithCard', answer, title, lastProduct.name);
     })
  },
  'randomBeer': function () {
    vinmonopolet.getProducts({facet: Facet.Category.BEER}).then (response => {
      var randomIndex = randomNumberWithin(response.products.length)

      var beer = response.products[randomIndex]
      var title = "Beer suggestion"
      var answer = 'We recommend ' + beer.name + ". Would you like to know more about this?"

      this.emit(':ask', answer);
    })
  },

  'AMAZON.YesIntent': function () {
    lastProduct = this.attributes["lastProduct"]
    var price = lastProduct.price
    var message = "Sorry we have no description of this wine"

    if (price) {
        message = "this yummy product tastes like " + price + " Norwegian crowns"

      if (Number(price) < 70) {
          message += " and is very cheap according to Norwegian standards"
      } else {
          message += " and is not worth the money, if you ask me!"
      }

    }


    this.emit(':tell', message)
  },
  'AMAZON.NoIntent': function () {
    this.emit(':tell', 'OK. Sorry to bother you!')
  },
  'Unhandled': function () {
    this.emit(':tell', 'Welcome to vinmonopolet, you can ask me to recommend you a wine')
  }
};

function randomNumberWithin(limit) {
  return Math.floor(Math.random() * limit)
}

