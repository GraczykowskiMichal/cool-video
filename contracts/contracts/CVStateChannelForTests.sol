pragma solidity ^0.4.4;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./CVCTokenForTests.sol";

contract CVStateChannelForTests {
  using SafeMath for uint256;

  address public channelOwner = msg.sender;
  CVCTokenForTests public token;

  enum ChannelState { NO_CHANNEL, OPEN, CLOSING }
  struct Channel {
    ChannelState state;
    uint256 amount;
    uint256 timeout;
    uint256 amountToClaim;
  }
  mapping (address => Channel) channels;

  function CVStateChannelForTests(address cvcTokenForTestsAddress) public {
    token = CVCTokenForTests(cvcTokenForTestsAddress);
  }

  function openChannel(address recipient, uint256 amount) public {
    require(recipient != channelOwner);
    require(amount > 0);
    require(channels[recipient].state == ChannelState.NO_CHANNEL);

    /// Deposit CVC Tokens
    /// if (!token.transferFrom(recipient, address(this), amount)) { throw; }

    Channel memory channel;
    channel.state = ChannelState.OPEN;
    channel.amount = amount;
    channels[recipient] = channel;
  }

  function closeChannel(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint256 amount, address recipient) public {
    Channel memory channel = channels[recipient];
    require((channel.state == ChannelState.OPEN) || (channel.state == ChannelState.CLOSING));
    if (!verifyReceipt(h, v, r, s, amount, recipient)) { throw; }

    if (channel.state == ChannelState.OPEN) {
      if (channel.amount < amount) { throw; }
    } else if (channel.state == ChannelState.CLOSING) {
      if (channel.amountToClaim >= amount) { throw; }
    } else { // Should never happen
      throw;
    }

    channel.state = ChannelState.CLOSING;
    channel.timeout = block.number + 256;
    channel.amountToClaim = amount;
    channels[recipient] = channel;
  }

  function claimTokens(address recipient) public {
    Channel memory channel = channels[recipient];
    require(channel.state == ChannelState.CLOSING);
    /// require(channel.timeout < block.number);

    /// token.transfer(channelOwner, channel.amountToClaim);
    /// token.transfer(recipient, channel.amount - channel.amountToClaim);

    delete channels[recipient];
  }

  function verifyReceipt(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint256 amount, address recipient) public returns (bool) {
    if (h != sha3(amount)) { return false; }
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = sha3(prefix, h);
    address addr = ecrecover(prefixedHash, v, r, s);
    return addr == recipient;
  }

  function getChannelState(address recipient) public returns (ChannelState state) {
    return channels[recipient].state;
  }

  function getChannelAmount(address recipient) public returns (uint256 amount) {
    return channels[recipient].amount;
  }

  function getChannelAmountToClaim(address recipient) public returns (uint256 amountToClaim) {
    return channels[recipient].amountToClaim;
  }
}
