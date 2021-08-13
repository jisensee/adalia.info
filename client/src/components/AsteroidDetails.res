open Belt

external spectralTypeToStr: Fragments.FullAsteroid.t_spectralType => string = "%identity"

@react.component
let make = (~asteroid: Fragments.FullAsteroid.t) => {
  let items = [
    ("Surface area", asteroid.surfaceArea->Format.surfaceArea->React.string, `km²`),
    ("Radius", asteroid.radius->Format.radius->React.string, "m"),
    (
      "Owner",
      switch asteroid.owner {
      | None => "unowned"->React.string
      | Some(owner) => <AsteroidOwner address=owner />
      },
      "",
    ),
    ("Spectral type", asteroid.spectralType->spectralTypeToStr->React.string, ""),
    ("Orbital period", asteroid.orbitalPeriod->Format.orbitalPeriod->React.string, "days"),
    ("Semi major axis", asteroid.semiMajorAxis->Format.semiMajorAxis->React.string, "AU"),
    ("Inclination", asteroid.inclination->Format.inclination->React.string, `°`),
    ("Eccentricity", asteroid.eccentricity->Format.eccentricity->React.string, ""),
  ]

  let cardUrl = `https://api.influenceth.io/metadata/asteroids/${asteroid.id->Int.toString}/card.svg`

  <>
    <h1> {`Asteroid '${asteroid.name}'`->React.string} </h1>
    <div className="flex flex-col space-y-7 lg:flex-row lg:space-x-7">
      <img className="lg:w-1/4 object-contain" src=cardUrl />
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 flex-grow">
        {items
        ->Array.map(((label, content, unit)) => <>
          <div className="text-cyan font-bold col-span-1"> {label->React.string} </div>
          <div className="col-span-2 lg:col-span-4"> content {` ${unit}`->React.string} </div>
        </>)
        ->React.array}
      </div>
    </div>
  </>
}
