pragma solidity 0.5.16;

contract HeadTail {
    address public userOneAddress;
    address public userTwoAddress;

    bool public userOneChoice;
    bool public userTwoChoice;

    function depositUserOne(bool choice) public payable {
        if (msg.value == 1 ether && userOneAddress == address(0) && userTwoAddress != msg.sender) {
            userOneAddress = msg.sender;
            userOneChoice = choice;
        }
    }

    function depositUserTwo(bool choice) public payable {
        if (msg.value == 1 ether && userOneAddress != address(0) && userTwoAddress == address(0) && userOneAddress != msg.sender) {
            userTwoAddress = msg.sender;
            userTwoChoice = choice;
        }
    }
}
