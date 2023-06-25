const Web3 = require("web3");
const BigNumber = require("bignumber.js");
const fetch = require("node-fetch");

async function getStETHPriceInUSDAtBlock(blockNumber) {
  // Connecter à un fournisseur Ethereum (ici Infura)
  const web3 = new Web3(
    "https://mainnet.infura.io/v3/INFURA_API"
  );

  // Adresse du contrat Uniswap pair pour stETH/ETH
  const uniswapPairAddress = "0x4028DAAC072e492d34a3Afdbef0ba7e35D8b55C4";

  // Contrat ABI pour Uniswap Pair (seulement la méthode getReserves nécessaire)
  const uniswapPairABI = [
    {
      constant: true,
      inputs: [],
      name: "getReserves",
      outputs: [
        { internalType: "uint112", name: "_reserve0", type: "uint112" },
        { internalType: "uint112", name: "_reserve1", type: "uint112" },
        { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  // Créer une instance du contrat Uniswap pair
  const uniswapPair = new web3.eth.Contract(uniswapPairABI, uniswapPairAddress);

  // Obtenir les réserves de la pair stETH/ETH au block spécifié
  const reserves = await uniswapPair.methods
    .getReserves()
    .call({}, blockNumber);

  // Convertir les réserves en montants de tokens
  const stethReserve = new BigNumber(reserves._reserve0);
  const ethReserve = new BigNumber(reserves._reserve1);

  // Calculer le prix de stETH en ETH
  const stethPriceInEth = ethReserve.dividedBy(stethReserve);

  // Obtenir le prix courant d'ETH en USD via l'API de CoinGecko
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );
  const data = await response.json();
  const ethPriceInUsd = new BigNumber(data.ethereum.usd);

  // Calculer le prix de stETH en USD
  const stethPriceInUsd = stethPriceInEth.multipliedBy(ethPriceInUsd);

  console.log(
    `Prix de stETH au block ${blockNumber}: ${stethPriceInUsd.toString()} USD`
  );
}

getStETHPriceInUSDAtBlock(16818085);
