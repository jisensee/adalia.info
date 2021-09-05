import { ExchangeRates } from './types'
import fetch from 'node-fetch'

interface EtherscanResponse {
  result: {
    ethusd: number
  }
}

let currentExchangeRates: ExchangeRates = {
  oneEthInUsd: 1,
}

const etherscanPriceUrl =
  'https://api.etherscan.io/api?module=stats&action=ethprice'
const updateExchangeRates = async () => {
  const response = await fetch(etherscanPriceUrl)
  const body = await response.json()
  const rates = body as EtherscanResponse
  currentExchangeRates = {
    oneEthInUsd: rates.result.ethusd,
  }
  console.log('Updated exchange rates', currentExchangeRates)
}

updateExchangeRates()

const minutes = (m: number) => m * 60 * 1000
setInterval(updateExchangeRates, minutes(10))

const getExchangeRates = () => currentExchangeRates
export default getExchangeRates
