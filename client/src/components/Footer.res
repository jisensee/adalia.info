@react.component
let make = () => {
  <div className="border-t-2 border-gray-600">
    <div className="container mx-auto p-4 flex flex-row justify-center space-x-20">
      <div className="flex flex-col">
        <Link className="text-cyan" to_=Link.Internal(Route.Support)>
          <Icon kind={Icon.Fas("hands-helping")}> {"How to support"->React.string} </Icon>
        </Link>
        <Link className="text-cyan" to_=Link.Internal(Route.Privacy)>
          <Icon kind={Icon.Fas("lock")}>
            <span className="ml-2"> {"Privacy"->React.string} </span>
          </Icon>
        </Link>
      </div>
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
    </div>
  </div>
}
