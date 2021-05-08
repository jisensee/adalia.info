open ReScriptUrql

let useResult = (query, handler) => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query, ())
  switch response {
  | Fetching => <div> {"Loading..."->React.string} </div>
  | Error(_) => <div> {"Could not fetch data"->React.string} </div>
  | Empty => <div> {"Nothing found"->React.string} </div>
  | Data(data) => data->handler
  | PartialData(data, _) => data->handler
  }
}
