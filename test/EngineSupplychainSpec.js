'use strict'

const AdminConnection = require('composer-admin').AdminConnection
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common')
const path = require('path')
const helpers = require('./helpers')

require('chai').should()

const namespace = 'org.acme.enginesupplychain'

describe('EngineSupplychainSpec', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } )
    let adminConnection
    let bnc

    // test resources
    let testManufacturer
    let testMerchant
    let testEngine
    let testCar

    // and their registries
    let manufacturerRegistry
    let merchantRegistry
    let engineRegistry
    let carRegistry

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = { name: 'embedded', 'x-type': 'embedded' }
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' })

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = { version: 1, userName: 'PeerAdmin', roles: [ 'PeerAdmin', 'ChannelAdmin' ] }
        const deployerCard = new IdCard(deployerMetadata, connectionProfile)
        deployerCard.setCredentials(credentials)

        const deployerCardName = 'PeerAdmin'
        adminConnection = new AdminConnection({ cardStore: cardStore })

        await adminConnection.importCard(deployerCardName, deployerCard)
        await adminConnection.connect(deployerCardName)
    })

    beforeEach(async () => {
        bnc = new BusinessNetworkConnection({ cardStore: cardStore })

        const adminUserName = 'admin'
        let adminCardName
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'))

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition)

        // Start the business network and configure an network admin identity
        const startOptions = { networkAdmins: [ { userName: adminUserName, enrollmentSecret: 'adminpw' } ] }
        const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions)

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`
        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName))

        // Connect to the business network using the network admin identity
        await bnc.connect(adminCardName)

        const factory = bnc.getBusinessNetwork().getFactory()
        manufacturerRegistry = await bnc.getParticipantRegistry(namespace + '.Manufacturer')
        merchantRegistry = await bnc.getParticipantRegistry(namespace + '.Merchant')
        engineRegistry = await bnc.getAssetRegistry(namespace + '.Engine')
        carRegistry = await bnc.getAssetRegistry(namespace + '.Car')

        testManufacturer = helpers.createManufacturer(namespace, factory, 'test-manufacturer')
        testMerchant = helpers.createMerchant(namespace, factory, 'test-merchant')
        testEngine = helpers.createEngine(namespace, factory, 'test-engine', testManufacturer)
        testCar = helpers.createCar(namespace, factory, 'test-car')

        await manufacturerRegistry.addAll([testManufacturer])
        await merchantRegistry.addAll([testMerchant])
        await engineRegistry.addAll([testEngine])
        await carRegistry.addAll([testCar])
    })

    describe('createEngineAsset', () => {
        it('should create an Engine by submitting a valid EngineCreation transaction', async () => {
            const factory = bnc.getBusinessNetwork().getFactory()

            const engineCreationTrans = factory.newTransaction(namespace, 'EngineCreation')
            engineCreationTrans.engineId = 'new-engine-id'
            engineCreationTrans.data = factory.newConcept(namespace, 'EngineProperties')
            engineCreationTrans.data.brand = 'Audi'
            engineCreationTrans.data.model = 'Fancy engine model'
            engineCreationTrans.data.horsePower = 400
            engineCreationTrans.data.cubicCapacity = 4000
            engineCreationTrans.data.cylindersAmount = 10

            const manufacturerRegistry = await bnc.getParticipantRegistry(namespace + '.Manufacturer')
            await manufacturerRegistry.addAll([])
            engineCreationTrans.manufacturer = factory.newRelationship(namespace, 'Manufacturer', testManufacturer.$identifier)

            await bnc.submitTransaction(engineCreationTrans)

            const allEngines = await engineRegistry.getAll()
            allEngines.length.should.equal(2)
        })
    })

    describe('transferEngineToMerchant', () => {
        it('should set the reference to a merchant for an engine', async () => {
            const factory = bnc.getBusinessNetwork().getFactory()

            const transferTrans = factory.newTransaction(namespace, 'EngineMerchantTransfer')
            transferTrans.merchant = factory.newRelationship(namespace, 'Merchant', testMerchant.$identifier)
            transferTrans.engine = factory.newRelationship(namespace, 'Engine', testEngine.$identifier)

            await bnc.submitTransaction(transferTrans)

            const allEngines = await engineRegistry.getAll()
            allEngines.length.should.equal(1)
            allEngines[0].merchant.$identifier.should.equal(testMerchant.$identifier)
        })
    })

    describe('installEngineToCar', () => {
        it('should set the reference to a car for an engine', async () => {
            const factory = bnc.getBusinessNetwork().getFactory()

            const installTrans = factory.newTransaction(namespace, 'EngineCarInstallation')
            installTrans.engine = factory.newRelationship(namespace, 'Engine', testEngine.$identifier)
            installTrans.car = factory.newRelationship(namespace, 'Car', testCar.$identifier)

            await bnc.submitTransaction(installTrans)

            const allEngines = await engineRegistry.getAll()
            allEngines.length.should.equal(1)
            allEngines[0].currentCar.$identifier.should.equal(testCar.$identifier)
        })
    })

    describe('createCar', () => {
        it('should insert a new Car asset', async () => {
            const factory = bnc.getBusinessNetwork().getFactory()

            const createCarTrans = factory.newTransaction(namespace, 'CarCreation')
            createCarTrans.carId = 'my-new-car-id'
            createCarTrans.legalIdDocument = 'some-important-car-id'

            await bnc.submitTransaction(createCarTrans)

            const allCars = await carRegistry.getAll()
            allCars.length.should.equal(2)
            allCars[0].legalDocumentId.should.equal('some-important-car-id')
            allCars[1].legalDocumentId.should.equal('legal-id-of-this-car')
        })
    })
})
