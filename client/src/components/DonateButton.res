let donateAddress = "0xA3C7a2943D26782dC271d0D36B99f7459b981eE8"

type donationState = ReadyToDonate | DonationPending | DonationSuccess | DonationError
type copyState = ReadyToCopy | CopyError | Copied

@react.component
let make = (~className="") => {
  let (state, setState) = React.useState(() => ReadyToDonate)
  let onClick = () => {
    setState(_ => DonationPending)
    Bindings.Web3.requestTx(donateAddress)
    ->Promise.thenResolve(() => setState(_ => DonationSuccess))
    ->Promise.catch(_ => Promise.resolve(setState(_ => DonationError)))
    ->ignore
  }
  let (copyState, setCopyState) = React.useState(() => ReadyToCopy)
  let onCopyClick = _ => {
    Bindings.Clipboard.write(donateAddress)
    ->Promise.thenResolve(() => {
      setCopyState(_ => Copied)
      Bindings.Timer.start(() => setCopyState(_ => ReadyToCopy), 3000)
    })
    ->Promise.catch(_ => Promise.resolve(setCopyState(_ => CopyError)))
    ->ignore
  }

  let donationStateMessage = switch state {
  | DonationSuccess =>
    <p className="text-primary-std"> {"Thanks for your contribution!"->React.string} </p>
  | DonationError =>
    <p className="text-red">
      {"Something went wrong...please try again or use the wallet address directly."->React.string}
    </p>
  | _ => React.null
  }

  <div className>
    <div className="flex flew-row mb-2 w-full sm:w-1/2 lg:w-1/3">
      <button
        className="mr-0 border-r-0 rounded-r-none w-1/2"
        disabled={state === DonationPending}
        onClick={_ => onClick()}>
        {switch state {
        | DonationPending => "Pending..."
        | _ => "Donate through your browser wallet"
        }->React.string}
      </button>
      <button className="ml-0 rounded-l-none w-1/2" onClick=onCopyClick>
        {switch copyState {
        | Copied => "Copied"
        | ReadyToCopy | CopyError => "Copy wallet address"
        }->React.string}
      </button>
    </div>
    {donationStateMessage}
    {switch copyState {
    | CopyError =>
      <p className="text-red-500">
        {`Could not copy the address. Please use it manually: ${donateAddress}`->React.string}
      </p>
    | _ => React.null
    }}
  </div>
}
