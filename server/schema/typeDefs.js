module.exports = `

  type Mutation {
    isLoggedIn: AuthPayload,
    addInvite(input: MetaDataInput): Token,
    addPost(input: PostInput): Post,
    editPost(input: PostInput): Post,
    deletePost(id: ID): PostDeletedResult,
    addUser(input: RegisterInput): AuthPayload,
    editUser(input: EditUserInput): User,
    login(
      email: String!, 
      password: String!
    ): AuthPayload
  }

  type Query {
    posts(limit: Int, offset: Int): PostsResult,
    post(id: String): Post,
    users: [User!]!,
    userSettings: UserSettings
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
    name: String,
    email: String,
    id: ID,
    role: Int,
    profileUrl: String
  }

  type MetaData {
    name: String,
    role: Int,
    email: String,
    user: User
  }

  input MetaDataInput {
    name: String,
    role: Int,
    email: String
  }

  input RegisterInput {
    name: String!,
    email: String!,
    password: String!,
    passwordConfirm: String!,
    inviteToken: String!
  }

  input EditUserInput {
    name: String,
    email: String,
    password: String,
    role: Int,
    id: ID!
  }

  

  input userSettingsInput {
    name: String!,
    email: String!,
  }

  type Token {
    token: String!,
    status: Int,
    type: Int!,
    metaData: MetaData,
    user: User
  }

  type UserSettings {
    user: User!,
    invites: [Token],
    canInvite: [Int]
  }

`;