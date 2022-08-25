// write test for fulfillRandomWords and two other functions
// come back and write tests
const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { resolve } = require("path")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft", function () {
          let randomIpfsNft, deployer, vrfCoordinatorV2Mock, mintFee
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "randomipfs"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              mintFee = await randomIpfsNft.getMintFee()
          })
          describe("fulfillRandomWords", function () {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      // we set up the listener right away in case the chain moves super fast
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenCounter = await randomIpfsNft.getTokenCounter()
                              const tokenURI = await randomIpfsNft.getDogTokenUris(0)
                              assert.equal(tokenCounter.toString(), "1")
                              assert.equal(tokenURI.toString().includes("ipfs://"), true)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      try {
                          const requestNftResponse = await randomIpfsNft.requestNft({ value: mintFee.toString() })
                          const requestNftReciept = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReciept.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (error) {
                          console.log(error)
                          reject(error)
                      }
                  })
              })
          })
      })
