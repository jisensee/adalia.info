open Belt

external spectralTypeToStr: Fragments.FullAsteroid.t_spectralType => string = "%identity"

@react.component
let make = (~asteroid: Fragments.FullAsteroid.t) => {
  let items = [
    ("Surface area", asteroid.surfaceArea->React.float, `km²`),
    ("Radius", asteroid.radius->React.float, "m"),
    ("Owner", asteroid.owner->Option.getWithDefault("unowned")->React.string, ""),
    ("Spectral type", asteroid.spectralType->spectralTypeToStr->React.string, ""),
    ("Orbital period", asteroid.orbitalPeriod->React.float, "days"),
    ("Semi major axis", asteroid.semiMajorAxis->React.float, "AU"),
    ("Inclination", asteroid.inclination->React.float, `°`),
    ("Eccentricity", asteroid.eccentricity->React.float, ""),
  ]

  let cardUrl = `http://api.influenceth.io/metadata/asteroids/${asteroid.id->Int.toString}/card.svg`

  <>
    <h1> {`Asteroid '${asteroid.name}'`->React.string} </h1>
    <div className="flex flex-col space-y-7 lg:flex-row lg:space-x-7">
      <img className="w-1/4 object-contain" src=cardUrl />
      <div className="grid grid-cols-3 gap-4 flex-grow">
        {items
        ->Array.map(((label, content, unit)) => <>
          <div className="text-cyan font-bold col-span-1"> {label->React.string} </div>
          <div className="col-span-2"> content {` ${unit}`->React.string} </div>
        </>)
        ->React.array}
      </div>
    </div>
  </>
}
