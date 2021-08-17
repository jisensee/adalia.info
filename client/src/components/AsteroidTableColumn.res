type t =
  | Id
  | Owner
  | Scanned
  | Name
  | Radius
  | SurfaceArea
  | OrbitalPeriod
  | SemiMajorAxis
  | Inclination
  | SpectralType
  | Eccentricity
  | EstimatedPrice

let toString = t =>
  switch t {
  | Id => "id"
  | Owner => "owner"
  | Scanned => "scanned"
  | Name => "name"
  | Radius => "radius"
  | SurfaceArea => "surfaceArea"
  | OrbitalPeriod => "orbitalPeriod"
  | SemiMajorAxis => "semiMajorAxis"
  | Inclination => "inclination"
  | SpectralType => "spectralType"
  | Eccentricity => "eccentricity"
  | EstimatedPrice => "estimatedPrice"
  }

let fromString = str =>
  switch str {
  | "id" => Some(Id)
  | "owner" => Some(Owner)
  | "scanned" => Some(Scanned)
  | "name" => Some(Name)
  | "radius" => Some(Radius)
  | "surfaceArea" => Some(SurfaceArea)
  | "orbitalPeriod" => Some(OrbitalPeriod)
  | "semiMajorAxis" => Some(SemiMajorAxis)
  | "inclination" => Some(Inclination)
  | "spectralType" => Some(SpectralType)
  | "eccentricity" => Some(Eccentricity)
  | "estimatedPrice" => Some(EstimatedPrice)
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
  | OrbitalPeriod => "Orbital period"
  | SemiMajorAxis => "Semi major axis"
  | Inclination => "Inclination"
  | SpectralType => "Type"
  | Eccentricity => "Eccentricity"
  | EstimatedPrice => "Estimated price"
  }
