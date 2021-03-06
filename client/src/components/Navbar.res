module Item = {
  @react.component
  let make = (~to_, ~children, ~onClick=?, ~className="", ~highlight=true, ~bold=false) =>
    <div className={className ++ " text-xl"}>
      <Link to_ highlight bold ?onClick> {children} </Link>
    </div>
}

module CurrencyToggle = {
  @react.component
  let make = (~selected, ~onChange) => {
    let options = [
      ("usd", Currency.USD->Currency.toString),
      ("eth", Currency.ETH->Currency.toString),
    ]
    let toString = c =>
      switch c {
      | Currency.ETH => "eth"
      | Currency.USD => "usd"
      }
    let fromString = s =>
      switch s {
      | "eth" => Currency.ETH
      | _ => Currency.USD
      }

    <Common.Select options toString fromString value=selected onChange compact={true} />
  }
}

module Menu = {
  @react.component
  let make = (~left, ~right, ~search, ~toggleDropdown) => {
    <div className="flex flex-row space-x-9 items-center w-full">
      search
      <div className="hidden xs:flex w-full">
        <div className="flex flex-row items-center space-x-9 flex-grow"> left </div>
        <div className="hidden md:flex flex-row items-center space-x-9"> right </div>
      </div>
      <div className="flex md:hidden w-full justify-end">
        <Vechai.Button className="flex !rounded-xl" onClick={_ => toggleDropdown()}>
          <Icon kind={Icon.Fas("bars")} />
        </Vechai.Button>
      </div>
    </div>
  }
}

module MenuDropdown = {
  @react.component
  let make = (~children, ~isOpen) => {
    let openClass = switch isOpen {
    | true => "max-h-all py-2"
    | false => "max-h-0 py-0"
    }
    <div
      className={`flex flex-col md:container md:mx-auto px-4 space-y-2 overflow-hidden transition-p duration-300 ${openClass}`}>
      children
    </div>
  }
}

module IconText = {
  @react.component
  let make = (~text, ~className="", ~right=false) => {
    let rightClass = switch right {
    | true => "xs:inline"
    | false => "xs:hidden"
    }
    <span className={`inline xl:inline ${rightClass} ${className}`}> {text->React.string} </span>
  }
}

@react.component
let make = (~className="") => {
  let {currency, setCurrency} = Currency.Store.use()

  let (isDropdownOpen, setDropdownOpen) = React.useState(() => false)

  let closeDropdown = () => setDropdownOpen(_ => false)

  let asteroidsItem =
    <Item to_=Link.Internal(Route.Asteroids) onClick={closeDropdown}>
      <Icon kind={Icon.Fas("meteor")}> <IconText text="Asteroids" /> </Icon>
    </Item>
  let statsItem =
    <Item to_=Link.Internal(Route.Stats) onClick={closeDropdown}>
      <Icon kind={Icon.Fas("chart-pie")}> <IconText text="Stats" /> </Icon>
    </Item>

  let currencyItem =
    <div className="flex flex-row items-center space-x-4">
      <span className="text-primary-std text-xl">
        <Icon kind={Icon.Fas("cog")} text="Currency" />
      </span>
      <CurrencyToggle selected=currency onChange=setCurrency />
    </div>

  let supportItem =
    <Item to_=Link.Internal(Route.Support) onClick={closeDropdown}>
      <Icon kind={Icon.Fas("thumbs-up")}> <IconText text="Support" right={true} /> </Icon>
    </Item>

  let homeItem =
    <Item to_=Link.Internal(Route.Home) bold=true className="text-2xl" onClick={closeDropdown}>
      <Icon kind={Icon.Fas("sun")}> {"adalia.info"->React.string} </Icon>
    </Item>

  let resourcesItem =
    <Item to_=Link.Internal(Route.Resources) onClick={closeDropdown}>
      <Icon kind={Icon.Fas("users")}> <IconText text="Resources" /> </Icon>
    </Item>

  let (searchOpen, setSearchOpen) = React.useState(() => false)

  React.useEffect0(() => {
    Bindings.Document.onKeyDown(event => {
      let isCtrl = event->ReactEvent.Keyboard.ctrlKey
      let isK = event->ReactEvent.Keyboard.key === "k"
      if isCtrl && isK {
        event->ReactEvent.Keyboard.preventDefault
        setSearchOpen(_ => true)
      }
    })
    None
  })

  let search =
    <div className="text-primary-std hover:text-primary-500">
      <Icon kind={Icon.Fas("search")} breakpoint={Icon.Xs} onClick={() => setSearchOpen(_ => true)}>
        <IconText text="Search" />
      </Icon>
    </div>

  let left = <> asteroidsItem statsItem resourcesItem </>

  let right = <> currencyItem supportItem </>
  let dropdownRight = <> supportItem currencyItem </>

  <nav className={`bg-fill py-2 ${className}`}>
    <Search.Dialog isOpen=searchOpen onOpenChange={o => setSearchOpen(_ => o)} />
    <div className="px-4 flex flex-row items-center space-x-9">
      homeItem <Menu search left right toggleDropdown={() => setDropdownOpen(o => !o)} />
    </div>
    <div className="hidden xs:flex md:hidden">
      <MenuDropdown isOpen=isDropdownOpen> dropdownRight </MenuDropdown>
    </div>
    <div className="flex xs:hidden">
      <MenuDropdown isOpen=isDropdownOpen> left dropdownRight </MenuDropdown>
    </div>
  </nav>
}
