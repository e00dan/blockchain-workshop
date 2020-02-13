pragma solidity 0.5.16;

contract HeadTail {
    address public userOneAddress;
    address public userTwoAddress;

    bool public userOneChoice;
    bool public userTwoChoice;

    constructor(bool choice) public payable {
        require(msg.value == 1 ether, "user has to pass exactly 1 ether to the constructor");

        userOneAddress = msg.sender;
        userOneChoice = choice;
    }

    function depositUserTwo(bool choice) public payable {
        require(msg.value == 1 ether, "user has to pass exactly 1 ether to the constructor");
        require(userTwoAddress == address(0), "userTwoAddress can't be already set");
        require(userOneAddress != msg.sender, "userTwoAddress has to differ from userOneAddress");

        userTwoAddress = msg.sender;
        userTwoChoice = choice;
    }
}
