@react.component
let make = () => <>
  <h1> {"Asteroids"->React.string} </h1>
  {Api.useResult(module(Queries.DataTableAsteroids), ({asteroids}) => <AsteroidTable asteroids />)}
</>
