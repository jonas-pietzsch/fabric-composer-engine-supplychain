Feature: Engine creation
 
    Background:
        Given I have deployed the business network definition ..

        And I have added the following participant of type org.acme.enginesupplychain.Manufacturer
            | memberId        | name                   |
            | lamborghini-123 | Automobili Lamborghini |

    Scenario: When I issue an EngineCreation transaction
        When I submit the following transaction of type org.acme.enginesupplychain.EngineCreation
            """
            {
                "$class": "org.acme.enginesupplychain.EngineCreation",
                "manufacturer": "lamborghini-123",
                "engineId": "my-new-engine-id",
                "data": {
                    "brand": "Lamborghini",
                    "model": "Lamborghini V12",
                    "horsePower": 273.7,
                    "cubicCapacity": 3465,
                    "cylindersAmount": 12
                } 
            }
            """
        Then I should have the following asset
            """
            {
                "$class": "org.acme.enginesupplychain.Engine",
                "engineId": "my-new-engine-id",
                "manufacturer": "lamborghini-123",
                "data": {
                    "brand": "Lamborghini",
                    "model": "Lamborghini V12",
                    "horsePower": 273.7,
                    "cubicCapacity": 3465,
                    "cylindersAmount": 12
                }
            }
            """
