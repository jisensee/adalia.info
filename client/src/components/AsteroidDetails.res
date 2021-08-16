open Belt

external spectralTypeToStr: Fragments.FullAsteroid.t_spectralType => string = "%identity"

@react.component
let make = (~asteroid: Fragments.FullAsteroid.t) => {
  let items = [
    ("Surface area", asteroid.surfaceArea->Format.surfaceArea->React.string, `km²`)->Some,
    ("Radius", asteroid.radius->Format.radius->React.string, "m")->Some,
    (
      "Owner",
      switch asteroid.owner {
      | None => "unowned"->React.string
      | Some(owner) => <AsteroidOwner address=owner />
      },
      "",
    )->Some,
    ("Spectral type", asteroid.spectralType->spectralTypeToStr->React.string, "")->Some,
    ("Orbital period", asteroid.orbitalPeriod->Format.orbitalPeriod->React.string, "days")->Some,
    ("Semi major axis", asteroid.semiMajorAxis->Format.semiMajorAxis->React.string, "AU")->Some,
    ("Inclination", asteroid.inclination->Format.inclination->React.string, `°`)->Some,
    ("Eccentricity", asteroid.eccentricity->Format.eccentricity->React.string, "")->Some,
    asteroid.estimatedPrice->Option.map(price => (
      "Estimated price",
      price->Format.price->React.string,
      "$",
    )),
  ]

  let cardUrl = `https://api.influenceth.io/metadata/asteroids/${asteroid.id->Int.toString}/card.svg`

  <>
    <h1> {`Asteroid '${asteroid.name}'`->React.string} </h1>
    <div className="flex flex-col space-y-7 lg:flex-row lg:space-x-7">
      <img className="lg:w-1/4 object-contain" src=cardUrl />
      <div className="grid grid-cols-12 gap-4 flex-grow">
        {items
        ->Array.keepMap(t => t)
        ->Array.map(((label, content, unit)) => <>
          <h4 className="col-span-3"> {label->React.string} </h4>
          <div className="col-span-9"> content {` ${unit}`->React.string} </div>
        </>)
        ->React.array}
      </div>
    </div>
  </>
}
