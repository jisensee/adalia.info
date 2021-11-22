open ReScriptUrql

external convertFilter: AsteroidFilters.queryFilter => Queries.ExportAsteroids.t_variables_AsteroidFilterInput =
  "%identity"

@val external windowOpen: string => unit = "open"

module Filter = AsteroidFilters.Filter
let makeFilterVariable = f => f->AsteroidFilters.makeFilterVariable->convertFilter

module FormatSelect = {
  @react.component
  let make = (~className, ~value, ~onChange) => {
    let options = [("csv", "CSV"), ("json", "JSON")]
    let toString = o =>
      switch o {
      | #JSON => "json"
      | #CSV => "csv"
      }
    let fromString = s =>
      switch s {
      | "json" => #JSON
      | _ => #CSV
      }
    <Common.Select className options toString fromString value onChange />
  }
}

type exportType = Full | Filtered

module ExportTypeSelect = {
  @react.component
  let make = (~value, ~onChange, ~filters, ~asteroidCount) => {
    let filtersActive = filters->AsteroidFilters.isActive
    module RadioGroup = Common.RadioGroup
    module Option = {
      open RadioGroup.Option
      @react.component
      let make = (~value, ~label, ~children, ~enabled=true) =>
        <RadioGroup.Option
          className={props => {
            let checkedClass = switch props.checked {
            | true => "bg-gray"
            | false => "border-opacity-disabled"
            }
            let enabledClass = switch enabled {
            | false => "cursor-not-allowed opacity-disabled hover:border-opacity-disabled"
            | true => "cursor-pointer"
            }
            `flex flex-col  p-2 border border-primary-std rounded-2xl hover:border-opacity-100 ${checkedClass} ${enabledClass}`
          }}
          disabled={!enabled}
          value>
          {props => <>
            {<RadioGroup.Label _as="div" className="font-bold text-primary-std">
              {label->React.string}
            </RadioGroup.Label>}
            <RadioGroup.Description _as="div"> children </RadioGroup.Description>
          </>}
        </RadioGroup.Option>
    }
    let count = asteroidCount->Belt.Int.toFloat->Format.formatFloat(0)

    <RadioGroup value onChange>
      <div className="flex flex-col space-y-2">
        <RadioGroup.Label _as="h4"> {"Export type"->React.string} </RadioGroup.Label>
        <Option value=Full label="Full export">
          {"Export all existing asteroids."->React.string}
        </Option>
        <Option value=Filtered label="Filtered export" enabled=filtersActive>
          {`Export all currently selected ${count} asteroids.`->React.string}
          {switch filtersActive {
          | true => <AsteroidFiltersSummary readonly={true} />
          | false => React.null
          }}
        </Option>
      </div>
    </RadioGroup>
  }
}

@react.component
let make = (
  ~asteroidCount,
  ~filters,
  ~sorting: QueryParams.sortingType,
  ~isOpen,
  ~onOpenChange,
) => {
  let filtersActive = filters->AsteroidFilters.isActive

  let (exportResult, exportAsteroids) = Hooks.useMutation(~mutation=module(Queries.ExportAsteroids))
  let (exportAllResult, exportAllAsteroids) = Hooks.useMutation(
    ~mutation=module(Queries.ExportAllAsteroids),
  )
  let fetching = exportResult.fetching || exportAllResult.fetching

  let f = makeFilterVariable(filters)
  let sortField = AsteroidPageHooks.getGqlSortingField(sorting.field)
  let sortMode = AsteroidPageHooks.getSortingMode(sorting.mode)

  let (format, setFormat) = React.useState(() => #CSV)

  let (exportType, setExportType) = React.useState(() =>
    switch filtersActive {
    | false => Full
    | true => Filtered
    }
  )

  let (downloadUrl: option<string>, setDownloadUrl) = React.useState(() => None)

  React.useEffect1(() => {
    let dUrl = switch (fetching, exportType) {
    | (false, Full) =>
      exportAllResult.data->Belt.Option.map(({exportAllAsteroids}) => exportAllAsteroids)
    | (false, Filtered) =>
      exportResult.data->Belt.Option.map(({exportAsteroids}) => exportAsteroids)
    | _ => None
    }
    setDownloadUrl(_ => dUrl)
    None
  }, [fetching])

  React.useEffect1(() => {
    setExportType(_ =>
      switch filtersActive {
      | true => Filtered
      | false => Full
      }
    )
    None
  }, [filtersActive])

  let vars: Queries.ExportAsteroids.t_variables = {
    format: format,
    filter: Some(f),
    sort: {
      field: sortField,
      mode: sortMode,
    }->Some,
  }

  let onExportClick = () =>
    switch exportType {
    | Full => exportAllAsteroids({format: format})->ignore
    | Filtered => exportAsteroids(vars)->ignore
    }

  React.useEffect1(() => {
    switch downloadUrl {
    | Some(url) => {
        windowOpen(url)
        setDownloadUrl(_ => None)
      }
    | None => ()
    }
    None
  }, [downloadUrl])

  let exportButton =
    <Vechai.Button size={#xl} type_="submit" onClick={_ => onExportClick()} disabled=fetching>
      {switch fetching {
      | true => <Common.LoadingSpinner text="Exporting..." />
      | false => <Icon kind={Icon.Fas("file-export")} text="Export" />
      }}
    </Vechai.Button>

  <Common.Dialog
    isOpen
    onOpenChange
    title={"Export asteroids"->React.string}
    description={"Export either your currently selected or all asteroids."->React.string}>
    <form className="mb-1" onSubmit={ReactEvent.Form.preventDefault}>
      <div className="flex flex-col space-y-3 mb-3">
        <h4 className="block"> {"Format"->React.string} </h4>
        <FormatSelect className="w-32" value=format onChange={f => setFormat(_ => f)} />
        <ExportTypeSelect
          value=exportType onChange={t => setExportType(_ => t)} filters asteroidCount
        />
        <div className="font-bold">
          {"Please give appropritate credit to adalia.info when publishing something that is derived from this data. Thank you!"->React.string}
        </div>
      </div>
      exportButton
    </form>
  </Common.Dialog>
}
