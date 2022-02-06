type t =
  | Id
  | Owner
  | Scanned
  | Name
  | Radius
  | SurfaceArea
  | Size
  | OrbitalPeriod
  | SemiMajorAxis
  | Inclination
  | SpectralType
  | Eccentricity
  | EstimatedPrice
  | Rarity

let toString = t =>
  switch t {
  | Id => "id"
  | Owner => "owner"
  | Scanned => "scanned"
  | Name => "name"
  | Radius => "radius"
  | SurfaceArea => "surfaceArea"
  | Size => "size"
  | OrbitalPeriod => "orbitalPeriod"
  | SemiMajorAxis => "semiMajorAxis"
  | Inclination => "inclination"
  | SpectralType => "spectralType"
  | Eccentricity => "eccentricity"
  | EstimatedPrice => "estimatedPrice"
  | Rarity => "rarity"
  }

let fromString = str =>
  switch str {
  | "id" => Some(Id)
  | "owner" => Some(Owner)
  | "scanned" => Some(Scanned)
  | "name" => Some(Name)
  | "radius" => Some(Radius)
  | "surfaceArea" => Some(SurfaceArea)
  | "size" => Some(Size)
  | "orbitalPeriod" => Some(OrbitalPeriod)
  | "semiMajorAxis" => Some(SemiMajorAxis)
  | "inclination" => Some(Inclination)
  | "spectralType" => Some(SpectralType)
  | "eccentricity" => Some(Eccentricity)
  | "estimatedPrice" => Some(EstimatedPrice)
  | "rarity" => Some(Rarity)
  | _ => None
  }

let toName = t =>
  switch t {
  | Id => "ID"
  | Owner => "Owner"
  | Scanned => "Scanned"
  | Name => "Name"
  | Radius => "Radius"
  | SurfaceArea => "Surface area"
  | Size => "Size"
  | OrbitalPeriod => "Orbital period"
  | SemiMajorAxis => "Semi major axis"
  | Inclination => "Inclination"
  | SpectralType => "Type"
  | Eccentricity => "Eccentricity"
  | EstimatedPrice => "Sale price"
  | Rarity => "Rarity"
  }

let allCols = [
  Owner,
  Name,
  SpectralType,
  Size,
  Rarity,
  SurfaceArea,
  Radius,
  OrbitalPeriod,
  SemiMajorAxis,
  Inclination,
  Eccentricity,
  EstimatedPrice,
  Scanned,
]

let defaultColumns = [Owner, Name, SpectralType, Size, SurfaceArea, OrbitalPeriod, Rarity]
