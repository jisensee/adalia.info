let referralLink = "https://game.influenceth.io?r=0xD90b1056F1E5DA3d81D09D643e6AC092ec3a7871"
@react.component
let make = () => {
  <>
    <h1> {"Support"->React.string} </h1>
    <p>
      {"This site is a community project that is not founded by any organization. If you wish to support this project there are multiple options:"->React.string}
    </p>
    <h3> {"Donate"->React.string} </h3>
    <p>
      {"The monthly AWS bill to keep this project online totals about $50 currently. If you wish to contribute, you can send some ETH my way here. This money is being invested to 100% into the community. First priority is keeping this site running, any excess will be spent on virtual space rocks and potentially distributed to other contributors."->React.string}
    </p>
    <p>
      {"If you like to claim a special donator role (and potentially more special perks) on the Discord server, please DM me before you donate so I can verify it. But it is obviously also fine if you prefer to stay anonymous."->React.string}
    </p>
    <DonateButton />
    <h3> {"Referral"->React.string} </h3>
    <p className="mb-0">
      {"Alternatively (or additionaly) you can use my "->React.string}
      <Link to_={Link.External(referralLink)}> {"referral link"->React.string} </Link>
    </p>
    <p>
      {"This does not cost you anything and is a great way to support this site and the developers of Influence alike."->React.string}
    </p>
    <h3> {"Become involved"->React.string} </h3>
    <p> {"There are also a bunch of non-monatary things you can do:"->React.string} </p>
    <ul className="list-disc ml-9">
      <li>
        {"Spread the word! The bigger the community grows, the more we all profit!"->React.string}
      </li>
      <li>
        {"Join the "->React.string}
        <Link to_=Link.discord> {"Discord "->React.string} </Link>
        {"server to chat about this site, leave feedback or just have a good time."->React.string}
      </li>
      <li>
        {"Did I mention that this site is 100% open source? Check out the "->React.string}
        <Link to_=Link.githubRepo> {"Github repository"->React.string} </Link>
        {"! Anyone can help to make this site better by filing issues with feature requests or bug reports. And of course you can also get your hands dirty and help directly by creating Pull Requests!"->React.string}
      </li>
    </ul>
    <p className="mt-5">
      {"Thanks for your support either way and see you in the belt!"->React.string}
    </p>
  </>
}
