// wrote all these tests by myself, could have easily done even more testing but want to keep moving. Note to self: compare my tests to github

const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft", function () {
          let basicNft, deployer
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              basicNft = await ethers.getContract("BasicNft", deployer)
          })
          describe("constructor", function () {
              it("intializes name, symbol, and token counter correctly", async function () {
                  const nftName = await basicNft.name()
                  const nftSymbol = await basicNft.symbol()
                  const tokenCount = await basicNft.getTokenCounter()
                  assert.equal(nftName, "Doggy")
                  assert.equal(nftSymbol, "DOG")
                  assert.equal(tokenCount.toString(), "0")
              })
          })
          describe("mintNft", function () {
              it("mints new nft to msg.sender with correct tokenID", async function () {
                  const tokenId = await basicNft.getTokenCounter()
                  const tx = await basicNft.mintNft()
                  tx.wait(1)
                  const minter = await basicNft.ownerOf(tokenId)
                  assert.equal(minter, deployer)
              })

              it("updates token counter", async function () {
                  const tokenCount = await basicNft.getTokenCounter()
                  const tx = await basicNft.mintNft()
                  tx.wait(1)
                  const tokenCountAfterMint = await basicNft.getTokenCounter()
                  assert.equal(tokenCount.toNumber() + 1, tokenCountAfterMint.toNumber())
              })
          })
          describe("tokenURI", function () {
              it("returns correct tokenURI", async function () {
                  const tokenURI = await basicNft.tokenURI("0")
                  assert.equal(
                      tokenURI.toString(),
                      "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
                  )
              })
          })
      })
