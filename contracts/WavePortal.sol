// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;
    
    mapping(address => uint256) lastWavedAt; 
    


    event NewWave(address indexed _from, uint256 timestamp, string message);

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    constructor() payable {
        seed = (block.timestamp + block.difficulty) % 100;
    }

    modifier _lastWavedAt() {
        require(
            lastWavedAt[msg.sender] + 5 minutes < block.timestamp,
            "Wait 5m"
        );

        lastWavedAt[msg.sender] = block.timestamp;
        _;
    }

    modifier _prizeAmount() {
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %d", seed);
        
        if (seed < 10) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0011 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        } else {
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
        _;
    }

    function wave(string memory _message) public _lastWavedAt _prizeAmount {
        totalWaves += 1;
        console.log("%s waved w/ message %s", msg.sender, _message);

        waves.push(Wave(msg.sender, _message, block.timestamp));
        emit NewWave(msg.sender, block.timestamp, _message);
    }


    function getAllWaves() public view returns(Wave[] memory) {
        return waves;
    }


    function getTotalWaves() public view returns(uint256) {
        console.log("I was waved at %d times!", totalWaves);
        return totalWaves;
        
    }
}