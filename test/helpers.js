function createManufacturer(namespace, factory, id) {
    const manu = factory.newResource(namespace, 'Manufacturer', id)
    manu.name = 'Some manufacturer for testing'

    return manu
}

module.exports = {
    createManufacturer
}