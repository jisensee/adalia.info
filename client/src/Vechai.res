type theme

@module("./Theme") external theme: theme = "theme"
@module("./Theme") external defaultColorScheme: string = "defaultColorScheme"

type size = [#xs | #sm | #md | #lg | #xl]
type variant = [#outline | #solid | #light]

module Provider = {
  @module("@vechaiui/react") @react.component
  external make: (~theme: theme, ~colorScheme: string, ~children: React.element) => React.element =
    "VechaiProvider"
}

module Kbd = {
  @module("@vechaiui/react") @react.component
  external make: (~children: React.element, ~className: string=?) => React.element = "Kbd"
}

module Input = {
  type type_ = [#text]
  @module("@vechaiui/react") @react.component
  external make: (
    ~className: string=?,
    ~value: string,
    ~onChange: ReactEvent.Form.t => unit,
    ~type_: type_=?,
    ~color: string=?,
    ~size: string=?,
    ~disabled: bool=?,
    ~invalid: bool=?,
    ~placeholder: string=?,
  ) => React.element = "Input"

  module Group = {
    @module("@vechaiui/react") @scope("Input") @react.component
    external make: (~children: React.element, ~className: string=?) => React.element = "Group"
  }
  module LeftElement = {
    @module("@vechaiui/react") @scope("Input") @react.component
    external make: (~children: React.element, ~className: string=?) => React.element = "LeftElement"
  }
  module RightElement = {
    @module("@vechaiui/react") @scope("Input") @react.component
    external make: (~children: React.element, ~className: string=?) => React.element =
      "RightElement"
  }
}

module Tag = {
  @module("@vechaiui/react") @react.component
  external make: (
    ~className: string=?,
    ~children: React.element,
    ~size: size=?,
    ~color: string=?,
    ~variant: variant=?,
  ) => React.element = "Tag"

  module Label = {
    @module("@vechaiui/react") @scope("Tag") @react.component
    external make: (~className: string=?, ~children: React.element) => React.element = "Label"
  }

  module CloseButton = {
    @module("@vechaiui/react") @scope("Tag") @react.component
    external make: (~className: string=?, ~onClick: unit => unit) => React.element = "CloseButton"
  }
}

module Button = {
  @module("@vechaiui/react") @react.component
  external make: (
    ~className: string=?,
    ~children: React.element,
    ~size: size=?,
    ~color: string=?,
    ~variant: variant=?,
    ~disabled: bool=?,
    ~onClick: ReactEvent.Mouse.t => unit=?,
    ~type_: string=?,
  ) => React.element = "Button"
}

module Select = {
  @module("@vechaiui/react") @react.component
  external make: (
    ~className: string=?,
    ~children: React.element,
    ~disabled: bool=?,
    ~value: string=?,
    ~onChange: ReactEvent.Form.t => unit=?,
  ) => React.element = "Select"
}

module Checkbox = {
  @module("@vechaiui/react") @react.component
  external make: (
    ~className: string=?,
    ~children: React.element=?,
    ~disabled: bool=?,
    ~size: size=?,
    ~checked: bool,
    ~onChange: ReactEvent.Form.t => unit=?,
  ) => React.element = "Checkbox"
}
