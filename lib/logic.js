'use strict';

var modelsNamespace = 'org.acme.enginesupplychain'

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/**
* Creation of a Engine asset triggered by physical production.
* @param {org.acme.enginesupplychain.EngineCreation} tx the transaction to create an engine
* @transaction
*/
function createEngineAsset(tx) {
    return getAssetRegistry(modelsNamespace + '.Engine')
        .then(function (engineRegistry) {
            var factory = getFactory();
            var engineId = guid();

            var engine = factory.newResource(modelsNamespace, 'Engine', engineId);

            var engineData = factory.newConcept(modelsNamespace, 'EngineProperties');
            engineData.brand = tx.data.brand;
            engineData.model = tx.data.model;
            engineData.horsePower = tx.data.horsePower;
            engineData.cubicCapacity = tx.data.cubicCapacity;
            engineData.cylindersAmount = tx.data.cylindersAmount;

            engine.data = engineData;
            engine.manufacturer = tx.manufacturer;

            return engineRegistry.add(engine);
        });
}

/**
* An engine is transfered to a merchant.
* @param {org.acme.enginesupplychain.EngineMerchantTransfer} tx the engine transfer transaction
* @transaction
*/
function transferEngineToMerchant(tx) {
    return getAssetRegistry(modelsNamespace + '.Engine')
        .then(function (engineRegistry) {
            var engine = tx.engine;
            engine.merchant = tx.merchant;

            return engineRegistry.update(engine);
        });
}

/**
* An engine is installed in a car.
* @param {org.acme.enginesupplychain.EngineCarInstallation} tx the engine into car installation transaction
* @transaction
*/
function installEngineToCar(tx) {
    return getAssetRegistry(modelsNamespace + '.Engine')
        .then(function (engineRegistry) {
            if (tx.car) {
                tx.engine.currentCar = tx.car;
                return engineRegistry.update(tx.engine);
            }

            return Promise.reject('No target car was set on the transaction!');
        });
}

/**
* A car is created
* @param {org.acme.enginesupplychain.CarCreation} tx transaction to create a new car
* @transaction
*/
function createCar(tx) {
    return getAssetRegistry(modelsNamespace + '.Car').then(function (carRegistry) {
        var factory = getFactory();
        var carId = guid();
        var car = factory.newResource(modelsNamespace, 'Car', carId);

        car.legalDocumentId = tx.legalIdDocument;

        return carRegistry.add(car);
    })
}
