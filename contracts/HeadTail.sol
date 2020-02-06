pragma solidity 0.5.16;

contract HeadTail {
    address public depositingUserAddress;

    function deposit() public payable {
        if (msg.value >= 1 ether) {
            depositingUserAddress = msg.sender;
        }
    }
}
