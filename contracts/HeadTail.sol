pragma solidity 0.6.1;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";

contract HeadTail {
    address payable public userOneAddress;
    bytes public userOneSignedChoiceHash;

    address payable public userTwoAddress;
    bool public userTwoChoice;
    uint public userTwoChoiceSubmittedTime;

    constructor(bytes memory _signedChoiceHash) public payable {
        require(msg.value == 1 ether, "user has to pass exactly 1 ether to the constructor");

        userOneAddress = msg.sender;
        userOneSignedChoiceHash = _signedChoiceHash;
    }

    function depositUserTwo(bool choice) public payable {
        require(msg.value == 1 ether, "user has to pass exactly 1 ether to the constructor");
        require(userTwoAddress == address(0), "userTwoAddress can't be already set");
        require(userOneAddress != msg.sender, "userTwoAddress has to differ from userOneAddress");

        userTwoAddress = msg.sender;
        userTwoChoice = choice;
        userTwoChoiceSubmittedTime = now;
    }

    function revealUserOneChoice(bool choice, string memory secret) public returns (bool) {
        require(userTwoAddress != address(0), "user two address has to be set before distributing prize");
        require(verify(createChoiceHash(choice, secret), userOneSignedChoiceHash) == userOneAddress, "choice signature has to be correct");
        require(address(this).balance == 2 ether, "prize has to be not been distributed yet");

        distributePrize(choice);

        return true;
    }

    function timeout() public returns (bool) {
        require(userTwoAddress != address(0), "user two address has to be set before distributing prize");
        require(address(this).balance == 2 ether, "prize has to be not been distributed yet");
        require(now >= userTwoChoiceSubmittedTime + 24 hours, "24 hours need to pass before ability to call timeout");

        userTwoAddress.transfer(2 ether);

        return true;
    }

    function verify(bytes32 hash, bytes memory signature) public pure returns (address) {
        return ECDSA.recover(ECDSA.toEthSignedMessageHash(hash), signature);
    }

    function createChoiceHash(bool choice, string memory secret) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(choice, secret));
    }

    function distributePrize(bool userOneChoice) private returns (bool) {
        if (userTwoChoice == userOneChoice) {
            userTwoAddress.transfer(2 ether);
        } else {
            userOneAddress.transfer(2 ether);
        }

        return true;
    }
}
