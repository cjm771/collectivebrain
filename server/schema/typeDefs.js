module.exports = `

  type Mutation {
    isLoggedIn: AuthPayload
    login(email: String!, password: String!): AuthPayload
  }

  type Query {
    hello: String!,
    posts: [Post!]!,
    users: [User!]!
  }

  type Post {
    id: ID!,
    title: String!,
    description: String,
    user: User!
  }

  type AuthPayload {
    token: String
    user: User
  }
  

  type User {
    name: String!,
    email: String!,
    profileUrl: String!
  }

`;