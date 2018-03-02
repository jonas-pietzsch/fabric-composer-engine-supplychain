/* global getAssetRegistry getFactory */

const modelsNamespace = 'org.acme.enginesupplychain'

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
* @param {org.acme.enginesupplychain.EngineCreation} tx - the transaction to create an engine
* @transaction
*/
async function createEngineAsset(tx) { // eslint-disable-line no-unused-vars
    const engineRegistry = await getAssetRegistry(modelsNamespace + '.Engine')
    const factory = getFactory()
    const engineId = guid()

    const engine = factory.newResource(modelsNamespace, 'Engine', engineId)

    let engineData = factory.newConcept(modelsNamespace, 'EngineProperties')
    // TODO: could be done shorter:
    engineData.brand = tx.data.brand
    engineData.model = tx.data.model
    engineData.horsePower = tx.data.horsePower
    engineData.cubicCapacity = tx.data.cubicCapacity
    engineData.cylindersAmount = tx.data.cylindersAmount
    // by...
    // engineData = Object.assign(engineData, tx.data);

    engine.data = engineData
    engine.manufacturer = tx.manufacturer

    await engineRegistry.add(engine)
}

/**
* An engine is transfered to a merchant.
* @param {org.acme.enginesupplychain.EngineMerchantTransfer} tx - the engine transfer transaction
* @transaction
*/
async function transferEngineToMerchant(tx) { // eslint-disable-line no-unused-vars
    const engineRegistry = await getAssetRegistry(modelsNamespace + '.Engine')
    const engine = tx.engine
    engine.merchant = tx.merchant

    await engineRegistry.update(engine)
}

/**
* An engine is installed in a car.
* @param {org.acme.enginesupplychain.EngineCarInstallation} tx - the engine into car installation transaction
* @transaction
*/
async function installEngineToCar(tx) { // eslint-disable-line no-unused-vars
    const engineRegistry = await getAssetRegistry(modelsNamespace + '.Engine')
    if (tx.car) {
        tx.engine.currentCar = tx.car
        return engineRegistry.update(tx.engine)
    }

    return Promise.reject('No target car was set on the transaction!')
}

/**
* A car is created
* @param {org.acme.enginesupplychain.CarCreation} tx - transaction to create a new car
* @transaction
*/
async function createCar(tx) { // eslint-disable-line no-unused-vars
    const carRegistry = await getAssetRegistry(modelsNamespace + '.Car')
    const factory = getFactory()
    const carId = guid()
    const car = factory.newResource(modelsNamespace, 'Car', carId)
    car.legalDocumentId = tx.legalIdDocument

    await carRegistry.add(car)
}
