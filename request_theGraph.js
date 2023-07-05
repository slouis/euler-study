const axios = require("axios");
var bigDecimal = require("js-big-decimal");

async function getEulerProtocolDataFromTheGraph(blockId) {
  const queryGQL = JSON.stringify({
    query: `
       { 
        _meta(block: {number: $blockId}) {
          block {
            timestamp
            number
          }
        }
        markets(
          orderBy: totalValueLockedUSD
          orderDirection: desc
          first: 1000
          block: {number: $blockId}
        ) {
          totalValueLockedUSD
          name
          inputToken {
            name
            symbol
            lastPriceUSD
            lastPriceBlockNumber
          }
          outputToken {
            name
            symbol
            lastPriceUSD
            lastPriceBlockNumber
            id
          }
        }
      }`,
    variables: { blockId: blockId },
  });
  var data = undefined;
  try {
    var response = (
      await axios({
        url: "https://gateway.thegraph.com/api/YOUR_API_KEY",
        method: "post",
        data: queryGQL,
      })
    ).data;

    data = response.data;
  } catch (e) {
    console.log(e);
    data = undefined;
  }

  var totalValueLockedUSD = new bigDecimal(0);
  data.markets.forEach((m) => {
    totalValueLockedUSD = totalValueLockedUSD.add(
      new bigDecimal(m.totalValueLockedUSD)
    );
  });

  return totalValueLockedUSD.value;
}

(async () => {
  try {
    //440671301.29635398513145361205417207758773099862558528716347072777589
    console.log(await getEulerProtocolDataFromTheGraph(16817994));
    //440671301.29635398513145361205417207758773099862558528716347072777589
    //console.log(await getEulerProtocolDataFromTheGraph(16817995));
    //829992271.92854606729720018379042314758773099862558528716347072777589
    //console.log(await getEulerProtocolDataFromTheGraph(16817996));
    //829992271.92854606729720018379042314758773099862558528716347072777589
    //console.log(await getEulerProtocolDataFromTheGraph(16817997));
  } catch (ex) {
    console.log(ex);
  }
})();
