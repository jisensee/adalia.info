open Belt

module LoadingSpinner = {
  @react.component
  let make = (~className="", ~text) => {
    <div className={`flex flex-col gap-y-3 p-4 items-center justify-center ${className}`}>
      <Icon kind={Icon.Fas("hourglass")} className={"text-9xl animate-bounce"} />
      <span className="text-2xl"> {text->React.string} </span>
    </div>
  }
}

module Select = {
  // Option is (<key>, <display>)
  @react.component
  let make = (
    ~className="",
    ~value,
    ~onChange,
    ~options,
    ~toString,
    ~fromString,
    ~compact=false,
    ~enabled=true,
  ) => {
    let onSelectChange = e => {
      ReactEvent.Form.currentTarget(e)["value"]->fromString->onChange
      e->ReactEvent.Form.preventDefault->ignore
    }
    let class =
      switch compact {
      | true => "py-1"
      | false => ""
      } ++
      className
    <Vechai.Select
      className=class value={value->toString} onChange=onSelectChange disabled={!enabled}>
      {options
      ->Belt.Array.map(((val, display)) =>
        <option key=val value=val> {display->React.string} </option>
      )
      ->React.array}
    </Vechai.Select>
  }
}

module NumberInput = {
  @react.component
  let make = (~className="", ~value, ~onChange, ~enabled=true) => {
    let onValueChange = e =>
      ReactEvent.Form.currentTarget(e)["value"]->Float.fromString->Option.forEach(onChange)

    <input
      className
      type_="number"
      value={value->Float.toString}
      onChange=onValueChange
      disabled={!enabled}
    />
  }
}

module NumberRangeInput = {
  @react.component
  let make = (~className="", ~inputClassName="", ~value, ~onChange, ~enabled) => {
    let (lower, upper) = value

    <div className={`flex flex-row items-center space-x-3 ${className}`}>
      <NumberInput
        className=inputClassName
        value=lower
        onChange={newLower => onChange((newLower, upper))}
        enabled
      />
      <Icon className="text-primary-stdary-std" kind={Icon.Fas("minus")} />
      <NumberInput
        className=inputClassName
        value=upper
        onChange={newUpper => onChange((lower, newUpper))}
        enabled
      />
    </div>
  }
}

module Popover = {
  @module("@headlessui/react") @react.component
  external make: (~className: string=?, ~children: React.element) => React.element = "Popover"

  module Button = {
    @module("@headlessui/react") @scope("Popover") @react.component
    external make: (
      ~className: string=?,
      ~children: React.element,
      ~_as: React.component<_>=?,
    ) => React.element = "Button"
  }

  module Panel = {
    @module("@headlessui/react") @scope("Popover") @react.component
    external make: (
      ~className: string=?,
      ~static: bool=?,
      ~children: React.element,
    ) => React.element = "Panel"
  }
}

module Transition = {
  @module("@headlessui/react") @react.component
  external make: (
    ~children: React.element,
    ~className: string=?,
    ~show: bool=?,
    ~appear: bool=?,
    ~enter: string=?,
    ~enterFrom: string=?,
    ~enterTo: string=?,
    ~leave: string=?,
    ~leaveFrom: string=?,
    ~leaveTo: string=?,
  ) => React.element = "Transition"
}

module Transitions = {
  module Appear = {
    @react.component
    let make = (~show=?, ~children) =>
      <Transition
        ?show
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0">
        children
      </Transition>
  }
  module HorizontalSlide = {
    @react.component
    let make = (~show=?, ~children) =>
      <Transition
        ?show
        enter="transition ease-in-out duration-200"
        enterFrom="transform scale-x-0 -translate-x-1/2"
        enterTo="transform scale-x-100 translate-x-0"
        leave="transition ease-out duration-100"
        leaveFrom="transform scale-x-100 translate-x-0"
        leaveTo="transform scale-x-0 -translate-x-1/2">
        {children}
      </Transition>
  }
}

module Dialog = {
  module Binding = {
    @module("@headlessui/react") @react.component
    external make: (
      ~children: React.element,
      ~className: string=?,
      ~_open: bool=?,
      ~onClose: unit => unit,
    ) => React.element = "Dialog"
  }

  module Overlay = {
    @module("@headlessui/react") @scope("Dialog") @react.component
    external make: (~className: string=?) => React.element = "Overlay"
  }

  module Title = {
    @module("@headlessui/react") @scope("Dialog") @react.component
    external make: (~children: React.element, ~className: string=?) => React.element = "Title"
  }

  module Description = {
    @module("@headlessui/react") @scope("Dialog") @react.component
    external make: (~children: React.element, ~className: string=?) => React.element = "Description"
  }

  @react.component
  let make = (
    ~className="",
    ~title,
    ~description,
    ~children,
    ~isOpen,
    ~onOpenChange,
    ~showCloseButton=true,
  ) => {
    <Transitions.Appear show=isOpen>
      <Binding
        className={`fixed inset-0 z-50 overflow-y-auto mx-4 flex justify-center items-center md:container md:mx-auto p-4 ${className}`}
        onClose={() => onOpenChange(false)}>
        <Overlay className="z-10 fixed inset-0 opacity-disabled" />
        <div
          className="relative z-20 flex-col py-2 px-4 rounded-2xl border-primary-200 border-2 bg-base">
          <div className="flex flex-row items-center justify-center">
            <Title className="flex flex-grow"> title </Title>
            {switch showCloseButton {
            | false => React.null
            | true =>
              <Icon
                className="text-3xl hover:text-primary-std"
                kind={Icon.Fas("times")}
                large={false}
                onClick={() => onOpenChange(false)}
              />
            }}
          </div>
          <Description> description </Description>
          children
        </div>
      </Binding>
    </Transitions.Appear>
  }
}

module RadioGroup = {
  @module("@headlessui/react") @react.component
  external make: (~children: React.element, ~value: 'a, ~onChange: 'a => unit) => React.element =
    "RadioGroup"

  module Label = {
    @module("@headlessui/react") @scope("RadioGroup") @react.component
    external make: (
      ~children: React.element,
      ~className: string=?,
      ~_as: string=?,
    ) => React.element = "Label"
  }

  module Description = {
    @module("@headlessui/react") @scope("RadioGroup") @react.component
    external make: (~children: React.element, ~_as: string=?) => React.element = "Description"
  }

  module Option = {
    type renderProps = {
      checked: bool,
      active: bool,
      disabled: bool,
    }
    @module("@headlessui/react") @scope("RadioGroup") @react.component
    external make: (
      ~children: renderProps => React.element,
      ~className: renderProps => string=?,
      ~value: 'a,
      ~disabled: bool=?,
    ) => React.element = "Option"
  }
}
