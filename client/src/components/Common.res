module LoadingSpinner = {
  @react.component
  let make = (~className="", ~text) => {
    <Icon kind={Icon.Fas("spinner")} className={`${className} animate-spin`}>
      {text->React.string}
    </Icon>
  }
}
