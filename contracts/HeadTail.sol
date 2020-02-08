pragma solidity 0.5.16;

contract HeadTail {
    address public userOneAddress;
    address public userTwoAddress;

    function depositUserOne() public payable {
        if (msg.value == 1 ether && userOneAddress == address(0) && userTwoAddress != msg.sender) {
            userOneAddress = msg.sender;
        }
    }

    function depositUserTwo() public payable {
        if (msg.value == 1 ether && userOneAddress != address(0) && userTwoAddress == address(0) && userOneAddress != msg.sender) {
            userTwoAddress = msg.sender;
        }
    }
}
