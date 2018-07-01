pragma solidity ^0.4.18;

import "./math/SafeMath.sol";
import "./erc20/ERC20.sol";

contract EventfulMarket {
  event LogItemUpdate(uint id);
  event LogTrade(uint pay_amt, address indexed pay_gem,
                 uint buy_amt, address indexed buy_gem);

  event LogMake(
    bytes32  indexed  id,
    bytes32  indexed  pair,
    address  indexed  maker,
    ERC20             pay_gem,
    ERC20             buy_gem,
    uint128           pay_amt,
    uint128           buy_amt,
    uint64            timestamp
  );

  event LogBump(
    bytes32  indexed  id,
    bytes32  indexed  pair,
    address  indexed  maker,
    ERC20             pay_gem,
    ERC20             buy_gem,
    uint128           pay_amt,
    uint128           buy_amt,
    uint64            timestamp
  );

  event LogTake(
    bytes32           id,
    bytes32  indexed  pair,
    address  indexed  maker,
    ERC20             pay_gem,
    ERC20             buy_gem,
    address  indexed  taker,
    uint128           take_amt,
    uint128           give_amt,
    uint64            timestamp
  );

  event LogKill(
    bytes32  indexed  id,
    bytes32  indexed  pair,
    address  indexed  maker,
    ERC20             pay_gem,
    ERC20             buy_gem,
    uint128           pay_amt,
    uint128           buy_amt,
    uint64            timestamp
  );
}

contract SimpleMarket is EventfulMarket {
  using SafeMath for uint256;

  uint public last_offer_id;

  mapping (uint => OfferInfo) public offers;

  bool locked;

  struct OfferInfo {
    uint     pay_amt;
    ERC20    pay_gem;
    uint     buy_amt;
    ERC20    buy_gem;
    address  owner;
    uint64   timestamp;
  }

  modifier can_buy(uint id) {
    require(isActive(id));
    _;
  }

  modifier can_cancel(uint id) {
    require(isActive(id));
    require(getOwner(id) == msg.sender);
    _;
  }

  modifier can_offer {
    _;
  }

  modifier synchronized {
    require(!locked);
    locked = true;
    _;
    locked = false;
  }

  // Make a new offer. Takes funds from the caller into market escrow.
  function offer(ERC20 pay_gem, uint pay_amt, ERC20 buy_gem, uint buy_amt)
    internal
    can_offer
    synchronized
    returns (uint id)
  {
    require(uint128(pay_amt) == pay_amt);
    require(uint128(buy_amt) == buy_amt);
    require(pay_amt > 0);
    require(pay_gem != ERC20(0x0));
    require(buy_amt > 0);
    require(buy_gem != ERC20(0x0));
    require(pay_gem != buy_gem);

    OfferInfo memory o;
    o.pay_amt = pay_amt;
    o.pay_gem = pay_gem;
    o.buy_amt = buy_amt;
    o.buy_gem = buy_gem;
    o.owner = msg.sender;
    o.timestamp = uint64(now);
    id = _next_id();
    offers[id] = o;

    require( pay_gem.transferFrom(msg.sender, this, pay_amt) );

    emit LogItemUpdate(id);
    emit LogMake(
      bytes32(id),
      keccak256(pay_gem, buy_gem),
      msg.sender,
      pay_gem,
      buy_gem,
      uint128(pay_amt),
      uint128(buy_amt),
      uint64(now)
    );
  }

  // Accept given `quantity` of an offer. Transfers funds from caller to
  // offer maker, and from market to caller.
  function buy(uint id, uint quantity)
    internal
    can_buy(id)
    synchronized
    returns (bool)
  {
    OfferInfo memory o = offers[id];
    uint spend = quantity.mul(o.buy_amt) / o.pay_amt;

    require(uint128(spend) == spend);
    require(uint128(quantity) == quantity);

    // For backwards semantic compatibility.
    if (quantity == 0 || spend == 0 ||
      quantity > o.pay_amt || spend > o.buy_amt)
    {
      return false;
    }

    offers[id].pay_amt = o.pay_amt.sub(quantity);
    offers[id].buy_amt = o.buy_amt.sub(spend);
    require( o.buy_gem.transferFrom(msg.sender, o.owner, spend) );
    require( o.pay_gem.transfer(msg.sender, quantity) );

    emit LogItemUpdate(id);
    emit LogTake(
      bytes32(id),
      keccak256(o.pay_gem, o.buy_gem),
      o.owner,
      o.pay_gem,
      o.buy_gem,
      msg.sender,
      uint128(quantity),
      uint128(spend),
      uint64(now)
    );
    emit LogTrade(quantity, o.pay_gem, spend, o.buy_gem);

    if (offers[id].pay_amt == 0) {
      delete offers[id];
    }

    return true;
  }

  // Cancel an offer. Refunds offer maker.
  function cancel(uint id)
    internal
    can_cancel(id)
    synchronized
    returns (bool success)
  {
    // read-only offer. Modify an offer by directly accessing offers[id]
    OfferInfo memory o = offers[id];
    delete offers[id];

    require( o.pay_gem.transfer(o.owner, o.pay_amt) );

    emit LogItemUpdate(id);
    emit LogKill(
      bytes32(id),
      keccak256(o.pay_gem, o.buy_gem),
      o.owner,
      o.pay_gem,
      o.buy_gem,
      uint128(o.pay_amt),
      uint128(o.buy_amt),
      uint64(now)
    );

    success = true;
  }

  function _next_id() internal returns (uint) {
    last_offer_id++;
    return last_offer_id;
  }

  // ---- Public entrypoints ---- //

  function isActive(uint id) public constant returns (bool active) {
    return offers[id].timestamp > 0;
  }

  function getOwner(uint id) public constant returns (address owner) {
    return offers[id].owner;
  }

  function getOffer(uint id)
    public
    constant
    returns (uint64, address, ERC20, uint, ERC20, uint)
  {
    OfferInfo memory o = offers[id];
    return (o.timestamp, o.owner, o.pay_gem, o.pay_amt, o.buy_gem, o.buy_amt);
  }

  function getOfferIds() public constant returns (uint[]) {
    uint counter = 0;
    uint id;

    for (id = 1; id <= last_offer_id; id++) {
      if (offers[id].timestamp > 0) counter++;
    }

    uint[] memory offerIds = new uint[](counter);
    counter = 0;

    for (id = 1; id <= last_offer_id; id++) {
      if (offers[id].timestamp > 0) {
        offerIds[counter] = id;
        counter++;
      }
    }

    return offerIds;
  }

  function make(ERC20 pay_gem, uint128 pay_amt, ERC20 buy_gem, uint128 buy_amt)
    public
    returns (uint id)
  {
    return offer(pay_gem, pay_amt, buy_gem, buy_amt);
  }

  function take(uint256 id, uint128 maxTakeAmount) public {
    require(buy(id, maxTakeAmount));
  }

  function kill(uint256 id) public {
    require(cancel(id));
  }
}
