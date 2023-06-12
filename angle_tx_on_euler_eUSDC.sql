--Code tested on Dune V2
--Set some constants --
WITH
  myConstants AS (
    SELECT
      -- Address of the ERC20 compatible eUSDC token (from Euler)
      0xeb91861f8a4e1c12333f42dce8fb0ecdc28da716 AS tokenAddress,
      -- Address of the smart contrat of Angle
      0xf5ad02f3dbbf4b42dee1f1255607f929ca2a7c5a AS angleContract,
      -- Euler dipatcher contract address
      0xe5afe81e63f0a52a3a03b922b30f73b8ce74d570 AS eulerDispatcher
  )
SELECT
  "from",
  "to",
  "value",
  "evt_block_time",
  "evt_block_number"
FROM
  erc20_ethereum.evt_Transfer,
  myConstants
WHERE
  contract_address = tokenAddress
  AND evt_block_time < CAST('2023-03-14' AS TIMESTAMP)
  -- Check if Angle contract is part of the transaction --
  AND (
    "from" = myConstants.angleContract
    OR "to" = myConstants.angleContract
  )
  -- Remove the technical transactions done by Euler dispatcher --
  AND (
    "from" <> myConstants.eulerDispatcher
    OR "to"<> myConstants.eulerDispatcher
  )
