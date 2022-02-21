// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract HeadTail {
    uint public counter;

    constructor() {
        counter = 1;
    }

    function setCounter(uint _counter) public {
        counter = _counter;
    }

    function counterMultiplied(uint _multiplier) public view
    returns (uint _counterMultiplied) {
        _counterMultiplied = counter * _multiplier;
    }

    function counterMultipliedBySquareOf(uint _multiplier) public view returns (uint) {
        return counterMultiplied(_multiplier) * _multiplier;
    }
}
