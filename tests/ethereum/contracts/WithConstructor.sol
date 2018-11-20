pragma solidity ^0.4.9;

contract WithConstructor {
    uint public num = 5;
    bytes32 internal data = "0xc0de";

    event NumChanged(uint n);
    event DataChanged(bytes32 d);

    function add(uint a) public returns (uint) {
        return num + a;
    }

    function WithConstructor(uint a, bytes32 d) public {
        num = a;
        data = d;
        DataChanged(d);
        NumChanged(a);
    }

    function setA(uint a) public {
        num = a;
        NumChanged(num);
    }

    function setData(bytes32 d) public {
        data = d;
        DataChanged(d);
    }

    function getData() public constant returns(bytes32) {
        return data;
    }
}