pragma solidity ^0.4.9;

contract WithConstructor {
    uint128 public num = 5;

    event NumChanged (uint128);

    function add(uint128 a) public returns (uint128) {
        return num + a;
    }

    function WithConstructor(uint128 a) public {
        num = a;
    }

    function setA(uint128 a) public {
        num = a;
        NumChanged(num);
    }

    function getNum() public returns(uint128) {
        return num+1;
    }

    function double(int a) constant returns(int) { 
        return 2 * a;
    }
}