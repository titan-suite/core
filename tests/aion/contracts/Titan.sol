contract Titan {
    uint128 public num = 5;
    bytes32[] public br;
    address public addr;
    uint[] public ir = [1,2,4];
    mapping(address => string) public map;

    function Titan(uint128 a, bytes32 b) {
        num=a;
        br.push(b);
    }
    function add(uint128 a) public returns (uint128, bytes32[], uint[]) {
        return (num + a, br, ir);
    }

    function setCR(bytes32[] _br) public {
        br = _br;
    }
    function setTR(uint[] _ir) public {
        ir = _ir;
    }
    function setAddr(address _addr, string _str) public {
        addr = _addr;
        map[_addr] = _str;
    }
}