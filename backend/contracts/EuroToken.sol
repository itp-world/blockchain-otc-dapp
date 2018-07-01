pragma solidity ^0.4.18;

import "./erc20/StandardToken.sol";


/**
 * @title EuroToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract EuroToken is StandardToken {

  string public name = "EuroToken";
  string public symbol = "EUR";
  uint256 public decimals = 2;
  uint256 public INITIAL_SUPPLY = 1000000000;

  /**
   * @dev Contructor that gives msg.sender all of existing tokens.
   */
  function EuroToken() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

}
