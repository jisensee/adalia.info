import { Constants } from './constants'

const numberFormatter =
  (maxDecimals: number, unit?: string) => (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: maxDecimals,
    }) + (unit ? ' ' + unit : '')

export const Format = {
  radius: numberFormatter(0, Constants.RADIUS_UNIT),
  surfaceArea: numberFormatter(0, Constants.SURFACE_AREA_UNIT),
  orbitalPeriod: numberFormatter(0, Constants.ORBITAL_PERIOD_UNIT),
  inclination: numberFormatter(2, Constants.INCLINATION_UNIT),
  semiMajorAxis: numberFormatter(2, Constants.SEMI_MAJOR_AXIS_UNIT),
  eccentricity: numberFormatter(2),
  ethAddress: (address: string, shownCharacters: number) => {
    const start = address.slice(0, shownCharacters + 2)
    const end = address.slice(-shownCharacters)
    return `${start}...${end}`
  },
}
