import { CronJob } from 'cron'
import fetch from 'node-fetch'
import { ExchangeRates } from './types'

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
  try {
    const response = await fetch(etherscanPriceUrl)
    const body = await response.json()
    const rates = body as EtherscanResponse
    currentExchangeRates = {
      oneEthInUsd: rates.result.ethusd,
    }
    console.log('Updated exchange rates', currentExchangeRates)
  } catch (err) {
    console.log('Failed to update exchange rates', err)
  }
}

updateExchangeRates()

const job = new CronJob('0 * * * *', updateExchangeRates)

const getExchangeRates = () => currentExchangeRates
export default getExchangeRates
