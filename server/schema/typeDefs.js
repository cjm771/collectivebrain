module.exports = `

  type Mutation {
    isLoggedIn: AuthPayload,
    addPost(input: PostInput): Post,
    editPost(input: PostInput): Post,
    deletePost(id: ID): PostDeletedResult,
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

  type PostDeletedResult {
    post: Post, 
    deletedFilesResults: DeletedFilesResults
  }

  type DeletedFilesResults {
    deleted: [File], 
    notDeleted: [File]
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
    id: ID,
    title: String!, 
    description: String!,
    startDate: String, 
    endDate: String,
    published: Boolean,
    creator: String,
    category: Int,
    subCategory: Int,
    tags: [String],
    sources: [String],
    files: [FileInput]
  }

  input FileInput {
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
    files: [File],
    keyFile: File,
    user: User!,
    lastEditedBy: User,
    createdAt: String,
    updatedAt: String
  }

  type File {
    src: String,
    srcThumb: String,
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