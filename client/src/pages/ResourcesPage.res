type item = {
  title: string,
  description: string,
  icon: Icon.kind,
  link: Link.kind,
}

module Item = {
  @react.component
  let make = (~item) => {
    <Link
      to_=item.link
      className="flex flex-col border-primary-std hover:bg-fill border rounded-xl p-3">
      <div className="flex flex-row space-x-4">
        <Icon kind=item.icon large={true} /> <h2> {item.title->React.string} </h2>
      </div>
      <p className="text-foreground"> {item.description->React.string} </p>
    </Link>
  }
}

let items = [
  {
    title: "Influence game",
    description: "The official game client for Influence.",
    icon: Icon.influence,
    link: Link.influenceGame,
  },
  {
    title: "Influence wiki",
    description: "The official wiki for all Influence related information.",
    icon: Icon.influence,
    link: Link.wiki,
  },
  {
    title: "influence-utils",
    description: "Official open source SDK to interact with Influence.",
    icon: Icon.Fab("github"),
    link: Link.influenceUtils,
  },
  {
    title: "Influence Sales",
    description: "Interactive charting tool to explore minted Influence Asteroids & Crew Members, as well as past trades and open listings on secondary market.",
    icon: Icon.Custom("influence-sales.png"),
    link: Link.influenceSalesSpace,
  },
  {
    title: "discover.adalia",
    description: "Interactive app that gives asteroid recommendations based on playstyle.",
    icon: Icon.Fas("link"),
    link: Link.discoverAdalia,
  },
  {
    title: "Cosmos bot",
    description: "Discord bot that interfaces with influence.",
    icon: Icon.cosmos,
    link: Link.cosmos,
  },
  {
    title: "adalia.info Github",
    description: "The Github repository containing the whole source code for this site.",
    icon: Icon.Fab("github"),
    link: Link.githubRepo,
  },
  {
    title: "Influence asset exporter",
    description: "Command-line tool that can export all Influence assets from a list of addresses.",
    icon: Icon.Fab("github"),
    link: Link.influenceAssetExport,
  },
  {
    title: "adalia.info Discord",
    description: "Official discord server for this site.",
    icon: Icon.Fab("discord"),
    link: Link.discord,
  },
  {
    title: "Influence International",
    description: "Influence themed Discord server to build local communities",
    icon: Icon.Fab("discord"),
    link: Link.influenceInternationalDiscord,
  },
  {
    title: "OpenSea asteroids",
    description: "Official OpenSea collection for asteroids.",
    icon: Icon.openSea,
    link: Link.openSeaAsteroids,
  },
  {
    title: "OpenSea crew",
    description: "Official OpenSea collection for crew.",
    icon: Icon.openSea,
    link: Link.openSeaCrew,
  },
]

@react.component
let make = () => <>
  <h1> {"Community resources"->React.string} </h1>
  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
    {items->Belt.Array.map(item => <Item key={item.title} item />)->React.array}
  </div>
</>
