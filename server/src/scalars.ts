import { GraphQLScalarType, Kind } from 'graphql'

export const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue: (value: string) => new Date(value),
  serialize: (date: Date) => date.toISOString(),
})
