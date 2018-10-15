/* global getAssetRegistry getFactory */

const namespace = 'org.acme.enginesupplychain'

/**
* Creation of a Engine asset triggered by physical production.
* @param {org.acme.enginesupplychain.EngineCreation} tx - the transaction to create an engine
* @transaction
*/
async function createEngineAsset(tx) { // eslint-disable-line no-unused-vars
    const engineRegistry = await getAssetRegistry(namespace + '.Engine')
    const engine = buildResource('Engine', tx.engineId)
    const engineData = buildConcept('EngineProperties')

    engine.data = Object.assign(engineData, tx.data)
    engine.manufacturer = tx.manufacturer

    await engineRegistry.add(engine)
}

/**
* An engine is transfered to a merchant.
* @param {org.acme.enginesupplychain.EngineMerchantTransfer} tx - the engine transfer transaction
* @transaction
*/
async function transferEngineToMerchant(tx) { // eslint-disable-line no-unused-vars
    const engineRegistry = await getAssetRegistry(namespace + '.Engine')
    tx.engine.merchant = tx.merchant

    await engineRegistry.update(tx.engine)
}

/**
* An engine is installed in a car.
* @param {org.acme.enginesupplychain.EngineCarInstallation} tx - the engine into car installation transaction
* @transaction
*/
async function installEngineToCar(tx) { // eslint-disable-line no-unused-vars
    const engineRegistry = await getAssetRegistry(namespace + '.Engine')
    if (tx.car) {
        tx.engine.currentCar = tx.car
        await engineRegistry.update(tx.engine)
    } else {
        return Promise.reject('No target car was set on the transaction!')
    }
}

/**
* A car is created
* @param {org.acme.enginesupplychain.CarCreation} tx - transaction to create a new car
* @transaction
*/
async function createCar(tx) { // eslint-disable-line no-unused-vars
    const carRegistry = await getAssetRegistry(namespace + '.Car')
    const car = buildResource('Car', tx.carId)
    car.legalDocumentId = tx.legalIdDocument

    await carRegistry.add(car)
}

const buildRelationship = (resourceName, resourceId) => getFactory().newRelationship(namespace, resourceName, resourceId)
const buildResource = (resourceName, resourceId) => getFactory().newResource(namespace, resourceName, resourceId)
const buildConcept = (conceptName) => getFactory().newConcept(namespace, conceptName)
const buildConceptWithData = (conceptName, data) => Object.assign(buildConcept(conceptName), data)
const buildEvent = (eventName) => getFactory().newEvent(namespace, eventName)
