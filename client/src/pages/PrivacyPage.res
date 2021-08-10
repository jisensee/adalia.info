@react.component
let make = () => {
  <>
    <h1> {"Privacy"->React.string} </h1>
    <h3> {"This site does not actively store your data!"->React.string} </h3>
    <p>
      {"Besides from log files that may contain IP-addresses, there is no user related data being stored by this website. IP-addresses are used short term to rate limit certain parts of this site to prevent abuse."->React.string}
    </p>
    <p>
      {"Some features might offer to connect to a brower based Ethereum wallet to obtain an Ethereum address. This is completely optional and only offered as a convenience function. Those addresses are never stored."->React.string}
    </p>
    <p> {"Besides that, no other personal data is being processed."->React.string} </p>
    <p>
      {"This site does currently not use any cookies, will never make use of tracking techniques or advertisements and will always be free to use. Funding to keep this site running is aquired privately and by voluntarly donations."->React.string}
    </p>
  </>
}
