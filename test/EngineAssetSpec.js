'use strict'

const AdminConnection = require('composer-admin').AdminConnection
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common')
const path = require('path')
const helpers = require('./helpers')

require('chai').should()

const namespace = 'org.acme.enginesupplychain'

describe('Engine asset', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } )
    let adminConnection
    let businessNetworkConnection
    let testManufacturer
    let manufacturerRegistry

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        }
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' })

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        }
        const deployerCard = new IdCard(deployerMetadata, connectionProfile)
        deployerCard.setCredentials(credentials)

        const deployerCardName = 'PeerAdmin'
        adminConnection = new AdminConnection({ cardStore: cardStore })

        await adminConnection.importCard(deployerCardName, deployerCard)
        await adminConnection.connect(deployerCardName)
    })

    beforeEach(async () => {
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore })

        const adminUserName = 'admin'
        let adminCardName
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'))

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition.getName())

        // Start the business network and configure an network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        }
        const adminCards = await adminConnection.start(businessNetworkDefinition, startOptions)

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`
        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName))

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName)

        const factory = businessNetworkConnection.getBusinessNetwork().getFactory()
        manufacturerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Manufacturer')
        testManufacturer = helpers.createManufacturer(namespace, factory, 'test-manufacturer')
        manufacturerRegistry.addAll([testManufacturer])
    })

    describe('#createEngineAsset', () => {
        it('should create an Engine by submitting a valid EngineCreation transaction', async () => {
            const factory = businessNetworkConnection.getBusinessNetwork().getFactory()

            const engineCreationTrans = factory.newTransaction(namespace, 'EngineCreation')
            engineCreationTrans.data = factory.newConcept(namespace, 'EngineProperties')
            engineCreationTrans.data.brand = 'Mercedes'
            engineCreationTrans.data.model = 'V12'
            engineCreationTrans.data.horsePower = 400
            engineCreationTrans.data.cubicCapacity = 4000
            engineCreationTrans.data.cylindersAmount = 12

            const manufacturerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Manufacturer')
            await manufacturerRegistry.addAll([])
            engineCreationTrans.manufacturer = factory.newRelationship(namespace, 'Manufacturer', testManufacturer.$identifier)

            await businessNetworkConnection.submitTransaction(engineCreationTrans)

            const engineRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Engine')
            const allEngines = await engineRegistry.getAll()
            allEngines.length.should.equal(1)
        })
    })
})
