const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Contract A", function () {
  async function deployOneYearLockFixture() {
    const A = await ethers.getContractFactory("A");
    const contractA = await A.deploy();
    return { contractA };
  }

  it("Should a equals 100", async function () {
    const { contractA } = await loadFixture(deployOneYearLockFixture);
    expect(await contractA.a()).to.equal(100);
  });
});
