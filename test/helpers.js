function createManufacturer(namespace, factory, id) {
    const manu = factory.newResource(namespace, 'Manufacturer', id)
    manu.name = 'Some manufacturer for testing'

    return manu
}

function createMerchant(namespace, factory, id) {
    const merchant = factory.newResource(namespace, 'Merchant', id)
    merchant.name = 'Some merchant name'

    return merchant
}

function createEngine(namespace, factory, id, manufacturer) {
    const engine = factory.newResource(namespace, 'Engine', id)
    const engineProps = factory.newConcept(namespace, 'EngineProperties')

    engineProps.brand = 'Mercedes'
    engineProps.model = 'V12'
    engineProps.horsePower = 400
    engineProps.cubicCapacity = 4000
    engineProps.cylindersAmount = 12

    engine.data = engineProps
    engine.manufacturer = factory.newRelationship(namespace, 'Manufacturer', manufacturer.$identifier)

    return engine
}

function createCar(namespace, factory, id) {
    const car = factory.newResource(namespace, 'Car', id)
    car.legalDocumentId = 'legal-id-of-this-car'

    return car
}

module.exports = {
    createManufacturer,
    createMerchant,
    createEngine,
    createCar
}
