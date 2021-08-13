let makeLink = ethAddress => `https://opensea.io/${ethAddress}`
module AddressLink = {
  @react.component
  let make = (~children, ~address) => <Link to_={Link.External(makeLink(address))}> children </Link>
}

let shortenAddress = ethAddress => {
  let len = ethAddress->Js.String2.length

  let start = ethAddress->Js.String2.substring(~from=0, ~to_=5)
  let end = ethAddress->Js.String2.substring(~from=len - 3, ~to_=len)

  `${start}...${end}`
}

@react.component
let make = (~address: string, ~shortAddress=false) => {
  switch address {
  | "" => "-"->React.string
  | add =>
    <AddressLink address=add>
      {switch shortAddress {
      | true => add->shortenAddress
      | false => add
      }->React.string}
    </AddressLink>
  }
}
