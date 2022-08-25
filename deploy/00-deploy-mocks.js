const { developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

//make base fee dynamic as an assignment for different chains
const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium. It costs 0.25 LINK per request
const GAS_PRICE_LINK = 1e9 //1000000000 //calculated value based on the gas price of the chain
//Chainlink Nodes pay the gas fees to give us randomness & do external execution. They call the functions in our contract
//So the price of requests changes based on the price of gas

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: args, //need a base fee and gas price link
        })
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks deployed!")
        log("--------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
