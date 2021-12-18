type theme

@module("./Theme") external theme: theme = "theme"
@module("./Theme") external defaultColorScheme: string = "defaultColorScheme"

type size = [#xs | #sm | #md | #lg | #xl]

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
    ~_type: type_,
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
