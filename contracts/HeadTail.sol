// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';

contract HeadTail is EIP712 {
    address payable public userOneAddress;
    bytes public userOneSignedChoiceHash;

    address payable public userTwoAddress;
    bool public userTwoChoice;
    uint256 public userTwoChoiceSubmittedTime;

    uint256 public stake;

    struct Mail {
        bool choice;
        string secret;
    }

    constructor() EIP712("HeadTail", "1") {}

    function depositUserOne(bytes memory _signedChoiceHash, uint128 _stake) public payable {
        require(
            msg.value == _stake,
            'user has to pass asset value equal to second parameter of the constructor (stake)'
        );
        require(userOneAddress == address(0), "userOneAddress can't be already set");
        stake = _stake;
        userOneAddress = payable(msg.sender);
        userOneSignedChoiceHash = _signedChoiceHash;
    }

    function depositUserTwo(bool choice) public payable {
        require(
            msg.value == stake,
            'user has to pass asset value equal to second parameter of the constructor (stake)'
        );
        require(userOneAddress != address(0), 'userOneAddress has to be already set');
        require(userTwoAddress == address(0), "userTwoAddress can't be already set");
        require(userOneAddress != msg.sender, 'userTwoAddress has to differ from userOneAddress');

        userTwoAddress = payable(msg.sender);
        userTwoChoice = choice;
        userTwoChoiceSubmittedTime = block.timestamp;
    }

    function revealUserOneChoice(bool choice, string memory secret) public returns (bool) {
        require(userOneAddress != address(0), 'userOneAddress has to be already set');
        require(
            userTwoAddress != address(0),
            'user two address has to be set before distributing prize'
        );
        require(
            verify(Mail(choice, secret), userOneSignedChoiceHash) == userOneAddress,
            'choice signature has to be correct'
        );
        require(address(this).balance == 2 * stake, 'prize has to be not been distributed yet');

        distributePrize(choice);

        return true;
    }

    function timeout() public returns (bool) {
        require(userOneAddress != address(0), 'userOneAddress has to be already set');
        require(
            userTwoAddress != address(0),
            'user two address has to be set before distributing prize'
        );
        require(address(this).balance == 2 * stake, 'prize has to be not been distributed yet');
        require(
            block.timestamp >= userTwoChoiceSubmittedTime + 24 hours,
            '24 hours need to pass before ability to call timeout'
        );

        userTwoAddress.transfer(2 * stake);

        return true;
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function verify(Mail memory mail, bytes memory signature) public view returns (address) {
        bytes32 digest =
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256('Mail(bool choice,string secret)'),
                        mail.choice,
                        keccak256(bytes(mail.secret))
                    )
                )
            );

        return ECDSA.recover(digest, signature);
    }

    function distributePrize(bool userOneChoice) private returns (bool) {
        if (userTwoChoice == userOneChoice) {
            userTwoAddress.transfer(2 * stake);
        } else {
            userOneAddress.transfer(2 * stake);
        }

        return true;
    }
}
