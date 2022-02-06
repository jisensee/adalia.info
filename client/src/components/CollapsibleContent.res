@react.component
let make = (~className="", ~titleClassName="", ~children, ~titleComp, ~isOpen, ~onOpenChange) => {
  let (iconRotation, height) = switch isOpen {
  | false => (None, "max-h-0")
  | true => (Some(Icon.Rotate90), "max-h-all")
  }
  <div className="w-full">
    <a
      className={`cursor-pointer flex w-full ${titleClassName}`}
      onClick={_ => onOpenChange(!isOpen)}>
      <Icon
        className="text-primary-std w-3 transition-all duration-300 mr-2"
        kind={Icon.Fas("chevron-right")}
        rotation=?iconRotation>
        titleComp
      </Icon>
    </a>
    <div
      className={`${height} overflow-hidden transition-max-h duration-300 ease-in-out ${className}`}>
      children
    </div>
  </div>
}
