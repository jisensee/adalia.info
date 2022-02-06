type set<'state> = ('state => 'state, bool) => unit
type useFullStoreHook<'state> = unit => 'state

@module("zustand")
external create: (set<'state> => 'state) => useFullStoreHook<'state> = "default"
