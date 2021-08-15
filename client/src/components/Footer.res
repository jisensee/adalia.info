module InternalLinks = {
  @react.component
  let make = () =>
    <div className="flex flex-col">
      <Link className="text-cyan" to_=Link.Internal(Route.Support)>
        <Icon kind={Icon.Fas("hands-helping")}> {"Support"->React.string} </Icon>
      </Link>
      <Link className="text-cyan" to_=Link.Internal(Route.Privacy)>
        <Icon kind={Icon.Fas("lock")}>
          <span className="ml-2"> {"Privacy"->React.string} </span>
        </Icon>
      </Link>
    </div>
}

module ExternalLinks = {
  @react.component
  let make = () =>
    <div className="flex flex-row space-x-3 justify-end items-center">
      <Link className="mr-2" to_=Link.discord highlight={false} hover={false}>
        <Icon kind={Icon.Fab("discord")} large={true} />
      </Link>
      <Link to_=Link.githubRepo highlight={false} hover={false}>
        <Icon kind={Icon.Fab("github")} large={true} />
      </Link>
      <Link className="text-cyan" to_=Link.influence highlight={false}>
        <Icon imageClassName="h-12" kind={Icon.Custom("influence.svg")} large={true} />
      </Link>
    </div>
}

module LastDataUpdateDisplay = {
  @react.component
  let make = (~lastDataUpdateAt=?) =>
    switch lastDataUpdateAt {
    | None => React.null
    | Some(_timestamp) =>
      <div className="flex justify-center text-base">
        {/* {`Last data update: ${timestamp->Js.Date.toLocaleString}`->React.string} */
        "Data is currently static from a snapshot of 2021-08-10"->React.string}
      </div>
    }
}

module VersionDisplay = {
  @react.component
  let make = (~version, ~linkRelease) => {
    let versionText = `Version: ${version}`->React.string
    <div className="flex justify-center text-base">
      {switch linkRelease {
      | false => versionText
      | true => <Link to_={Link.makeReleaseLink(version)}> versionText </Link>
      }}
    </div>
  }
}

@react.component
let make = (~version, ~linkRelease, ~lastDataUpdateAt=?) => {
  <div className="border-t-2 border-gray-600">
    <div className="container mx-auto p-4 flex flex-col space-y-3">
      <div className="flex flex-row justify-center space-x-20">
        <InternalLinks /> <ExternalLinks />
      </div>
      <LastDataUpdateDisplay ?lastDataUpdateAt />
      <VersionDisplay version linkRelease />
    </div>
  </div>
}
