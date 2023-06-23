const axios = require('axios');
const Web3 = require('web3');

const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');

// Crée une pause de 200 millisecondes entre chaque appel pour respecter la limite de l'API
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getABI(contractAddress, apiKey) {
    await sleep(200); // Pause ici
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === "1") {
            return JSON.parse(response.data.result);
        } else {
            throw new Error(response.data.result);
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'ABI : ${error}`);
    }
}

async function getDecodedLogs(transactionHash, apiKey) {
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    const logsDecoded = [];

    for (let log of receipt.logs) {
        const contractAddress = log.address;
        const abi = await getABI(contractAddress, apiKey);
        const contract = new web3.eth.Contract(abi, contractAddress);

        // Find the correct event
        let eventObject = null;
        for(let abiElement of abi) {
            if(abiElement.type === "event") {
                const eventSignature = abiElement.name + "(" + abiElement.inputs.map(input => input.type).join(",") + ")";
                const eventSignatureHash = web3.utils.sha3(eventSignature);
                if(log.topics[0] === eventSignatureHash) {
                    eventObject = abiElement;
                    break;
                }
            }
        }

        if(eventObject === null) {
            console.log("Event name could not be determined for this log.");
            continue;
        }

        const decodedLog = contract._decodeEventABI.call(eventObject, log);
        logsDecoded.push(decodedLog);
    }

    return logsDecoded;
}

// Utilisation de la fonction dans une fonction asynchrone auto-invoquée
(async function() {
    const apiKey = 'YOUR_ETHERSCAN_KEY';
    const transactionHash = '0xc310a0affe2169d1f6feec1c63dbc7f7c62a887fa48795d327d4d2da2d6b111d';

    const logs = await getDecodedLogs(transactionHash, apiKey);
    console.log(logs);
})();
