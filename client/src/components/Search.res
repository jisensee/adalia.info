open Belt
let ethAddressLen = 42
let isEthAddress = s => s->Js.String2.startsWith("0x") && s->String.length == 42

module Handler = {
  let tokenizeAll = text => text->Js.String2.split(" ")->Array.map(Js.String2.trim)
  let tokenizeHandler = text => text->Js.String2.split(",")->Array.map(Js.String2.trim)
  type t = {
    searchesFor: array<string>,
    handle: string => bool,
  }
  type filters = PageQueryParams.AsteroidPageParamType.filters
  let emptyFilters = PageQueryParams.AsteroidPageParamType.emptyFilters
  type asteroidFilterHandler = {
    searchesFor: string,
    getFilter: (string, filters) => filters,
  }
  let asteroidId = {
    searchesFor: ["An asteroid ID"],
    handle: text =>
      switch Belt.Int.fromString(text) {
      | None => false
      | Some(id) => {
          Route.go(Route.Asteroid(id->Belt.Int.toString))
          true
        }
      },
  }
  let getAsteroidsRoute = filters => Route.Asteroids({
    pageNum: None,
    pageSize: None,
    sort: None,
    filters: Some(filters),
    columns: None,
  })
  let owner = {
    searchesFor: "An owner address",
    getFilter: (text, currentFilter) =>
      switch text->isEthAddress {
      | false => currentFilter
      | true => {
          ...currentFilter,
          owners: [text]->Some,
        }
      },
  }
  let owned = {
    searchesFor: "Owned or owned asteroids",
    getFilter: (text, currentFilter) =>
      switch text->Js.String2.toLowerCase {
      | "owned" => {...currentFilter, owned: Some(true)}
      | "unowned" => {...currentFilter, owned: Some(false)}
      | _ => currentFilter
      },
  }
  let size = {
    searchesFor: "Asteroid sizes",
    getFilter: (text, currentFilter) => {
      let sizes = text->tokenizeHandler->Belt.Array.keepMap(EnumUtils.sizeFromString)
      if sizes->Belt.Array.size === 0 {
        currentFilter
      } else {
        {...currentFilter, sizes: Some(sizes)}
      }
    },
  }

  let spectralType = {
    searchesFor: "Asteroid spectral types",
    getFilter: (text, currentFilter) => {
      let spTypes = text->tokenizeHandler->Array.keepMap(EnumUtils.spectralTypeFromString)
      if spTypes->Array.size > 0 {
        {...currentFilter, spectralTypes: Some(spTypes)}
      } else {
        currentFilter
      }
    },
  }

  let scanned = {
    searchesFor: "Scanned or unscanned asteroids",
    getFilter: (text, currentFilter) =>
      switch text->Js.String2.toLowerCase {
      | "scanned" => {...currentFilter, scanned: Some(true)}
      | "unscanned" => {...currentFilter, scanned: Some(false)}
      | _ => currentFilter
      },
  }

  let rarity = {
    searchesFor: "Asteroid rarities",
    getFilter: (text, currentFilter) => {
      let rarities = text->tokenizeHandler->Array.keepMap(EnumUtils.rarityFromString)
      if rarities->Array.size > 0 {
        {...currentFilter, rarities: Some(rarities)}
      } else {
        currentFilter
      }
    },
  }

  let filterHandlers = [owner, owned, size, spectralType, rarity, scanned]

  let asteroidFilter = {
    searchesFor: filterHandlers->Array.map(fh => fh.searchesFor),
    handle: text => {
      let tokens = text->tokenizeAll
      let filters = filterHandlers->Array.reduce(emptyFilters, (filters, handler) => {
        tokens->Array.reduce(filters, (f, token) => handler.getFilter(token, f))
      })
      if filters === emptyFilters {
        false
      } else {
        Route.go(getAsteroidsRoute(filters))
        Bindings.Location.reload()
        true
      }
    },
  }

  let all = [asteroidFilter, asteroidId]
}

module Input = {
  type action = TextChange(string) | Submit
  type state = {
    text: string,
    valid: bool,
    submitted: bool,
  }

  let handleSubmit = state => {
    switch Handler.all->Belt.Array.some(h => h.handle(state.text) === true) {
    | true => {
        ...state,
        text: "",
        submitted: true,
      }
    | false => {
        ...state,
        valid: false,
      }
    }
  }

  let reducer = (state, action) =>
    switch action {
    | TextChange(text) => {...state, text: text}
    | Submit => handleSubmit(state)
    }

  let initialState = {
    text: "",
    valid: true,
    submitted: false,
  }

  @react.component
  let make = (~onSubmit) => {
    let (state, dispatch) = React.useReducer(reducer, initialState)
    let onChange = e => ReactEvent.Form.currentTarget(e)["value"]->TextChange->dispatch
    let handleSubmit = e => {
      ReactEvent.Form.preventDefault(e)
      dispatch(Submit)
    }
    React.useEffect1(() => {
      if state.submitted {
        onSubmit()
      }
      None
    }, [state.submitted])

    <form className="w-full" onSubmit=handleSubmit>
      <Vechai.Input.Group className="flex flex-row mt-2 w-full align-middle">
        <Vechai.Input.LeftElement className="h-full">
          <Icon kind={Icon.Fas("search")} className="text-lg" />
        </Vechai.Input.LeftElement>
        <Vechai.Input
          className="form-field-lg"
          _type=#text
          color="blue"
          placeholder="huge,large incomparable"
          value=state.text
          onChange
          invalid={!state.valid}
        />
      </Vechai.Input.Group>
    </form>
  }
}

module Dialog = {
  module Info = {
    @react.component
    let make = (~text) =>
      <div className="border border-cyan rounded-xl p-3"> {text->React.string} </div>
  }
  @react.component
  let make = (~isOpen, ~onOpenChange) => {
    <Common.Dialog
      title={<Input onSubmit={() => onOpenChange(false)} />}
      description={React.null}
      isOpen
      onOpenChange
      showCloseButton={false}>
      <div className="flex flex-col space-y-2">
        <span className="font-bold"> {"You can search for"->React.string} </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Handler.all
          ->Array.map(h => h.searchesFor->List.fromArray)
          ->List.fromArray
          ->List.flatten
          ->List.toArray
          ->Array.map(text => <Info key=text text />)
          ->React.array}
        </div>
        <span>
          {"Separate with spaces between filters and with a comma within a filter."->React.string}
        </span>
        <div className="flex flex-row space-x-2 align-middle">
          <span> {"Use "->React.string} </span>
          <Vechai.Kbd className="mt-1"> {"Ctrl"->React.string} </Vechai.Kbd>
          <Vechai.Kbd className="mt-1"> {"K"->React.string} </Vechai.Kbd>
          <span> {"to open the search quickly!"->React.string} </span>
        </div>
      </div>
    </Common.Dialog>
  }
}
