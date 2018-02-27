# org.acme.enginesupplychain
## Hyperledger Fabric & Composer "Engine Supplychain" example

This repository defines the source code for a Hyperledger Composer Business Network Definition. The network models a consortium of engine manufacturers and merchants which trace the production, sale and installation of car engines into cars of end customers.

## Branching strategy

Initial and final versions are stored in two separate branches to guide developers throw the process of developing a Business Network Definition for Composer.
This repository was created to demo the engine supplychain application [in a German article for Informatik Aktuell](https://www.informatik-aktuell.de).
There is also an [english version at codecentric AG blog](https://blog.codecentric.de).


### Initial version (default branch)

In the branch `initial` you will find unfinished application skeleton. It can be started but contains no application code, yet. 

```
git checkout initial
```

### Final version

In the `master` branch you will find the final solution application. It contains implementations that fulfill a simple engine supplychain show case.

```
git checkout master
```

## Final functionality covered

There are different roles/personas: `Manufacturer`, `Merchant` and the interests of a `Customer` by tracing cars by unique legal identifiers of real cars.

1. As a `Manufacturer` I want to be able to create produced motors with a unique serial number in order to track further history of it and prove uniqueness.
2. As a `Manufacturer` I want to be able to transfer ownership of inserted motors to a `Merchant` in order to model a sell proccess to it.
3. As a `Merchant` I want to be able to transfer an owned motor to a `Customer` in order to model a sell process/installation process into his car.
4. As a `Customer` I want to claim the two-year warranty by help of a `Merchant` at a `Manufacturer` in order to get a motors' damage repaired or refunded.
5. As a `Customer` or `Merchant` or `Manufacturer` I want to report a stolen motor in order to let everyone know that its serial number now resolves to a stolen item.


## How to use?

* Install pre-requisites for Hyperledger Fabric
* Install pre-requisites for Hyperledger Composer
* Install Composer and its dev tools itself
* Compile this repository to a `.bna` file: `cd fabric-composer-engine-supplychain && composer archive create -t dir -n .`

For more information on Fabric and Composer and how to deploy `.bna` files to Fabric Networks, please read their development and operations documentation.
