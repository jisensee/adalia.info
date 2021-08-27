open Belt

external spectralTypeToStr: Fragments.FullAsteroid.t_spectralType => string = "%identity"

module Category = {
  @react.component
  let make = (~title, ~items, ~initialOpen=false) => {
    let (isOpen, setOpen) = React.useState(() => initialOpen)
    let titleComp = <h2> {title->React.string} </h2>
    <div className="bg-gray flex py-2 px-5 rounded-2xl">
      <CollapsibleContent
        className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-7"
        titleComp
        isOpen
        onOpenChange={o => setOpen(_ => o)}>
        {items
        ->Array.keepMap(t => t)
        ->Array.map(((label, content, unit)) =>
          <React.Fragment key=label>
            <h3 className="flex"> {label->React.string} </h3>
            <div className="flex text-xl mb-5 last:mb-2"> content {` ${unit}`->React.string} </div>
          </React.Fragment>
        )
        ->React.array}
      </CollapsibleContent>
    </div>
  }
}

@react.component
let make = (~asteroid: Fragments.FullAsteroid.t) => {
  let generalItems = [
    (
      "Owner",
      switch asteroid.owner {
      | None => "unowned"->React.string
      | Some(owner) => <AsteroidOwner address=owner shortAddress={true} />
      },
      "",
    )->Some,
    (
      "Spectral type",
      <AsteroidSpectralType
        spectralType={asteroid.asteroidType.spectralType->EnumUtils.spectralTypeToString}
      />,
      "",
    )->Some,
    (
      "Scanned",
      switch asteroid.scanned {
      | true => "Yes"
      | false => "No"
      }->React.string,
      "",
    )->Some,
    asteroid.asteroidRarity.rarity
    ->Option.map(EnumUtils.rarityToString)
    ->Option.map(rarity => <AsteroidRarity rarity />)
    ->Option.map(element => ("Rarity", element, "")),
  ]
  let sizeItems = [
    ("Size", asteroid.asteroidSize.size->EnumUtils.sizeToString->React.string, "")->Some,
    ("Surface area", asteroid.surfaceArea->Format.surfaceArea->React.string, `km²`)->Some,
    ("Radius", asteroid.radius->Format.radius->React.string, "m")->Some,
    asteroid.estimatedPrice->Option.map(price => (
      "Estimated price",
      ("$" ++ price->Format.price)->React.string,
      "",
    )),
  ]
  let orbitalItems = [
    ("Orbital period", asteroid.orbitalPeriod->Format.orbitalPeriod->React.string, "days")->Some,
    ("Semi major axis", asteroid.semiMajorAxis->Format.semiMajorAxis->React.string, "AU")->Some,
    ("Inclination", asteroid.inclination->Format.inclination->React.string, `°`)->Some,
    ("Eccentricity", asteroid.eccentricity->Format.eccentricity->React.string, "")->Some,
  ]

  let cardUrl = `https://api.influenceth.io/metadata/asteroids/${asteroid.id->Int.toString}/card.svg`

  <>
    <h1> {`Asteroid '${asteroid.name}'`->React.string} </h1>
    <div className="flex flex-col sm:flex-row sm:space-x-5">
      <div className="mb-5 sm:mb-1 w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
        <img src=cardUrl className="object-contain object-top mb-5" />
        <AsteroidActions
          id={asteroid.id->Belt.Int.toString}
          orbitalPeriod=asteroid.orbitalPeriod
          owned={asteroid.owner != None}
          actionTextBreakpoint={Icon.Lg}
        />
      </div>
      <div className="flex flex-col space-y-5">
        <Category title="General" items=generalItems initialOpen={true} />
        <Category title="Size" items=sizeItems />
        <Category title="Orbitals" items=orbitalItems />
      </div>
    </div>
  </>
}
