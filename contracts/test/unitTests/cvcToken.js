import {createWeb3, deployContract, expectThrow} from 'ethworks-solidity';
import CVCTokenJson from '../../build/contracts/CVCTokenForTests.json';
import chai from 'chai';
import bnChai from 'bn-chai';
import Web3 from 'web3';

const {expect} = chai;
const web3 = createWeb3(Web3);
chai.use(bnChai(web3.utils.BN));

describe('CVCToken', () => {
  const {BN} = web3.utils;
  let user1, user2;
  let contract;
  let accounts;
  const totalSupply = new BN('1000000000');
  const args = [totalSupply];

  before(async () => {
    accounts = await web3.eth.getAccounts();
    [user1, user2] = accounts;
  });

  beforeEach(async () => {
    contract = await deployContract(web3, CVCTokenJson, user1, args);
  });

  it('should be deployed successfully', async () => {
    const {address} = contract.options;
    expect(address).to.not.be.null;
  });

  it('should be deployed with correct total supply', async () => {
    const actualTotalSupply = await contract.methods.totalSupply().call();
    expect(actualTotalSupply).to.eq.BN(totalSupply);
  });

  it('should be deployed with all tokens belonging to creator', async () => {
    const actualUser1Balance = await contract.methods.balanceOf(user1).call();
    const actualUser2Balance = await contract.methods.balanceOf(user2).call();
    expect(actualUser1Balance).to.eq.BN(totalSupply);
    expect(actualUser2Balance).to.eq.BN(new BN('0'));
  });

  it('should transfer correct amount', async () => {
    const transferAmount = new BN('100');
    await contract.methods.transfer(user2, transferAmount).send({from: user1});
    const actualUser1Balance = await contract.methods.balanceOf(user1).call();
    const actualUser2Balance = await contract.methods.balanceOf(user2).call();
    expect(actualUser1Balance).to.eq.BN(totalSupply - transferAmount);
    expect(actualUser2Balance).to.eq.BN(transferAmount);
  });

  it('should approve correct amount', async () => {
    const approveAmount = new BN('100');
    await contract.methods.approve(user2, approveAmount).send({from: user1});
    const actualUser2Allowance = await contract.methods.allowance(user1, user2).call();
    expect(actualUser2Allowance).to.eq.BN(approveAmount);
  });

  it('let transfer correct amount after approval', async () => {
    const approveAmount = new BN('100');
    await contract.methods.approve(user2, approveAmount).send({from: user1});
    await contract.methods.transferFrom(user1, user2, approveAmount).send({from: user2});
    const actualUser1Balance = await contract.methods.balanceOf(user1).call();
    const actualUser2Balance = await contract.methods.balanceOf(user2).call();
    expect(actualUser1Balance).to.eq.BN(totalSupply - approveAmount);
    expect(actualUser2Balance).to.eq.BN(approveAmount);
  });

  it('should not allow to transfer more than owned', async () => {
    const transferAmount = new BN('1');
    await contract.methods.transfer(user1, transferAmount).send({from: user2});
    const actualUser1Balance = await contract.methods.balanceOf(user1).call();
    const actualUser2Balance = await contract.methods.balanceOf(user2).call();
    expect(actualUser1Balance).to.eq.BN(totalSupply);
    expect(actualUser2Balance).to.eq.BN(new BN('0'));
  });

  it('should not allow to transfer more than owned after approval', async () => {
    const approveAmount = new BN('1');
    await contract.methods.approve(user1, approveAmount).send({from: user2});
    await contract.methods.transferFrom(user2, user1, approveAmount).send({from: user1});
    const actualUser1Balance = await contract.methods.balanceOf(user1).call();
    const actualUser2Balance = await contract.methods.balanceOf(user2).call();
    expect(actualUser1Balance).to.eq.BN(totalSupply);
    expect(actualUser2Balance).to.eq.BN(0);
  });

  it('shoud let approve more than owned', async () => {
    const approveAmount = new BN('1');
    await contract.methods.approve(user1, approveAmount).send({from: user2});
    const actualUser1Allowance = await contract.methods.allowance(user2, user1).call();
    expect(actualUser1Allowance).to.eq.BN(approveAmount);
  });
});
