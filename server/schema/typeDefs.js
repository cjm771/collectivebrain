module.exports = `

  type Mutation {
    isLoggedIn: AuthPayload,
    addPost(input: PostInput): Post,
    login(
      email: String!, 
      password: String!
    ): AuthPayload
  }

  type Query {
    posts(limit: Int, offset: Int): PostsResult,
    post(id: String): Post,
    users: [User!]!
  }

  type PostsResult {
    total: Int,
    start: Int,
    end: Int,
    next: Int,
    limit: Int,
    posts: [Post!]!
  }

  input PostInput {
    title: String!, 
    description: String!,
    startDate: String, 
    endDate: String,
    published: Boolean,
    creator: String,
    category: Int,
    tags: [String],
    sources: [String],
    images: [ImageInput]
  }

  input ImageInput {
    src: String!,
    caption: String
  }

  type Post {
    id: ID!,
    title: String!,
    description: String,
    published: Boolean!,
    creator: String,
    category: String,
    subCategory: String,
    startDate: String,
    endDate: String,
    tags: [String],
    sources: [String],
    images: [Image],
    keyImage: Image,
    user: User!,
    createdAt: String,
    updatedAt: String
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