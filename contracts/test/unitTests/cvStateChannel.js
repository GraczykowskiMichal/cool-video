import {createWeb3, deployContract, expectThrow} from 'ethworks-solidity';
import CVCTokenJson from '../../build/contracts/CVCTokenForTests.json';
import CVStateChannelJson from '../../build/contracts/CVStateChannelForTests.json';
import chai from 'chai';
import bnChai from 'bn-chai';
import Web3 from 'web3';

const {expect} = chai;
const web3 = createWeb3(Web3);
chai.use(bnChai(web3.utils.BN));

describe('CVStateChannel', () => {
  const {BN} = web3.utils;
  let user1, user2;
  let tokenContract, channelContract;
  let accounts;
  const totalTokenSupply = new BN('1000000000');
  const tokenArgs = [totalTokenSupply];
  const channelArgs = [tokenContract];

  const channelAmount = new BN('100');

  const getSignedReceipt = async (value, signer) => {
    const msgValueStr = value.toString();
    const h = web3.utils.soliditySha3({type: "uint256", value: msgValueStr});
    const signed = await web3.eth.sign(h, signer);
    const sig = signed.slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v = web3.utils.hexToNumber(sig.slice(128, 130)) + 27
    return [h, v, r, s];
  }

  before(async () => {
    accounts = await web3.eth.getAccounts();
    [user1, user2] = accounts;
  });

  beforeEach(async () => {
    tokenContract = await deployContract(web3, CVCTokenJson, user1, tokenArgs);
    channelContract = await deployContract(web3, CVStateChannelJson, user1, channelArgs);
  });

  it('should be deployed successfully', async () => {
    const {address} = channelContract.options;
    expect(address).to.not.be.null;
  });

  it('should open channel correctly', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const actualChannelState = await channelContract.methods.getChannelState(user2).call();
    expect(actualChannelState).to.eq.BN(new BN('1')); // 1 -> ChannelState.OPEN
  });

  it('should not allow to open channel with zero amount', async () => {
    await expectThrow(channelContract.methods.openChannel(user2, new BN('0')).send({from: user1}));
  });

  it('should not allow to open channel with channel owner', async () => {
    await expectThrow(channelContract.methods.openChannel(user1, new BN('0')).send({from: user1}));
  });

  it('should not allow to open channel while recipient already has one', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    await expectThrow(channelContract.methods.openChannel(user2, channelAmount).send({from: user1}));
  });

  it('should close channel correctly', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const amountToCloseWith = 10;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user2);
    await channelContract.methods.closeChannel(h, v, r, s, new BN(amountToCloseWith), user2).send({from: user2});
    const actualChannelState = await channelContract.methods.getChannelState(user2).call();
    const actualChannelAmountToClaim = await channelContract.methods.getChannelAmountToClaim(user2).call();
    expect(actualChannelState).to.eq.BN(new BN('2')); // 2 -> ChannelState.CLOSING
    expect(actualChannelAmountToClaim).to.eq.BN(new BN(amountToCloseWith));
  });

  it('should not allow to close not opened channel', async () => {
    const amountToCloseWith = 10;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user2);
    await expectThrow(channelContract.methods.closeChannel(h, v, r, s, new BN(amountToCloseWith), user2).send({from: user2}));
  });

  it('should not allow to close channel with fake receipt', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const amountToCloseWith = 10;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user1);
    await expectThrow(channelContract.methods.closeChannel(h, v, r, s, new BN(amountToCloseWith), user2).send({from: user2}));
  });

  it('should not allow to close channel with too high receipt', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const amountToCloseWith = 200;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user2);
    await expectThrow(channelContract.methods.closeChannel(h, v, r, s, new BN(amountToCloseWith), user2).send({from: user2}));
  });

  it('should not allow to re-close channel with not bigger amount', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const amountToCloseWith = 10;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user2);
    await channelContract.methods.closeChannel(h, v, r, s, new BN(amountToCloseWith), user2).send({from: user2});
    const smallerAmount = 5;
    const [h2, v2, r2, s2] = await getSignedReceipt(smallerAmount, user2);
    await expectThrow(channelContract.methods.closeChannel(h2, v2, r2, s2, new BN(smallerAmount), user2).send({from: user2}));
  });

  it('should not allow to close channel with amount not matching receipt', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const amountToCloseWith = 10;
    const biggerAmount = 20;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user2);
    await expectThrow(channelContract.methods.closeChannel(h, v, r, s, new BN(biggerAmount), user2).send({from: user2}));
  });

  it('should allow to claim tokens correctly', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    const amountToCloseWith = 10;
    const [h, v, r, s] = await getSignedReceipt(amountToCloseWith, user2);
    await channelContract.methods.closeChannel(h, v, r, s, new BN(amountToCloseWith), user2).send({from: user2});
    await channelContract.methods.claimTokens(user2).send({from: user2});
    const actualChannelState = await channelContract.methods.getChannelState(user2).call();
    expect(actualChannelState).to.eq.BN(new BN('0')); // 0 -> ChannelState.NO_CHANNEL
  });

  it('should not allow to claim tokens while not closing', async () => {
    await channelContract.methods.openChannel(user2, channelAmount).send({from: user1});
    await expectThrow(channelContract.methods.claimTokens(user2).send({from: user2}));
  });

  it('should verify receipt correctly', async () => {
    const amount = 10;
    const [h, v, r, s] = await getSignedReceipt(amount, user1);
    console.log("h = " + h);
    console.log("v = " + v);
    console.log("r = " + r);
    console.log("s = " + s);
    console.log("user1 = " + user1);
    const result = await channelContract.methods.verifyReceipt(h, v, r, s, new BN(amount), user1).call();
    expect(result).to.be.equal(true);
  });
});
