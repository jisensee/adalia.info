@react.component
let make = () => {
  Api.useResult(module(Queries.DataTableAsteroids), ({asteroids}) => <>
    <h1> {"Adalia.info"->React.string} </h1> <AsteroidTable asteroids />
  </>)
}
