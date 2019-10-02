module.exports = `

  type Mutation {
    isLoggedIn: AuthPayload
    login(email: String!, password: String!): AuthPayload
  }

  type Query {
    posts: [Post!]!,
    users: [User!]!
  }

  type Post {
    id: ID!,
    title: String!,
    description: String,
    published: Boolean!,
    creator: String,
    category: String,
    startDate: String,
    endDate: String,
    tags: [String],
    images: [Image]
    user: User!
  }

  type Image {
    src: String,
    caption: String,
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