@react.component
let make = (
  ~className="",
  ~useForm=false,
  ~children,
  ~title,
  ~footer,
  ~expanded,
  ~onExpandedChange,
) => {
  let customContent =
    <div className="grid gap-3 h-full grid-rows-[auto_1fr_auto]">
      <div className="flex flex-row">
        <h2 className="flex flex-grow"> {title->React.string} </h2>
        <Icon
          className="hover:text-primary-std text-3xl"
          kind={Icon.Fas("times")}
          onClick={_ => onExpandedChange(false)}
        />
      </div>
      <div className="overflow-y-auto"> {children} </div>
      <div className=""> {footer} </div>
    </div>
  let customContent = switch useForm {
  | true =>
    <form className="h-full" onSubmit={ReactEvent.Form.preventDefault}> {customContent} </form>
  | false => customContent
  }

  let expander =
    <Vechai.Button
      className="flex items-center justify-center w-full h-full p-4 text-xl font-bold text-primary-300 !border-0"
      onClick={_ => onExpandedChange(true)}>
      <span className="text-vertical transform rotate-180 text-primary-300">
        {title->React.string}
      </span>
    </Vechai.Button>

  let inner = switch expanded {
  | true => customContent
  | false => expander
  }

  let expandedClasses = switch expanded {
  | true => "p-6 w-screen md:w-[20rem] lg:w-[35rem]"
  | false => "p-0 w-[3rem]"
  }

  <div
    className={`${expandedClasses} h-full rounded-l-md transition-all ease-in-out duration-100 rounded-r-2xl border-2 border-primary-std ${className}`}>
    {inner}
  </div>
}
