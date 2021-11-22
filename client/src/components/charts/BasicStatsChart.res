open Belt

@react.component
let make = (~basicStats) => {
  let totalSurfaceArea = 31484352.
  open Fragments.BasicAsteroidStats
  let owned = basicStats.owned->Int.toFloat
  let scanned = basicStats.scanned->Int.toFloat
  let area = basicStats.surfaceArea
  let max = basicStats.count->Int.toFloat
  <div className="flex flex-col space-y-1">
    <ProgressBar
      value={owned}
      max
      textConfigs={ProgressBar.defaultTextConfigs(
        ~title="Owned",
        ~value=owned,
        ~max,
        ~formatValue=Format.formatFloat(_, 0),
        ~formatMax=Format.formatFloat(_, 0),
        (),
      )}
    />
    <ProgressBar
      value={scanned}
      max
      textConfigs={ProgressBar.defaultTextConfigs(
        ~title="Scanned",
        ~value=scanned,
        ~max,
        ~formatValue=Format.formatFloat(_, 0),
        ~formatMax=Format.formatFloat(_, 0),
        (),
      )}
    />
    <ProgressBar
      value={area}
      max={totalSurfaceArea}
      textConfigs={ProgressBar.defaultTextConfigs(
        ~title="Surface area",
        ~value=area,
        ~max=totalSurfaceArea,
        ~formatValue=Format.bigFloat,
        ~formatMax=Format.bigFloat,
        ~unit=` km²`,
        (),
      )}
    />
  </div>
}
