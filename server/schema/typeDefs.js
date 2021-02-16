module.exports = `

  type Mutation {
    isLoggedIn: AuthPayload,
    resendInvite(token: ID!): Token,
    addInvite(input: MetaDataInput): Token,
    addPost(input: PostInput): Post,
    editPost(input: PostInput): Post,
    deletePost(id: ID): PostDeletedResult,
    addUser(input: RegisterInput): AuthPayload,
    editUser(input: EditUserInput): UserSettings,
    login(
      email: String!, 
      password: String!
    ): AuthPayload
  }

  type Query {
    posts(group: ID, limit: Int, offset: Int): PostsResult,
    post(id: String): Post,
    group(id: String): Group,
    users: [User!]!,
    groups: [Group!]!,
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
    group: ID,
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
    srcThumb: String,
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
    group: Group,
    canEdit: Boolean,
    lastEditedBy: User,
    createdAt: String,
    updatedAt: String
  }

  type File {
    src: String,
    srcThumb: String,
    caption: String,
  }

  type Group {
    id: ID,
    name: String
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
    profileUrl: String,
    activeGroup: Group,
    theme: String
  }

  type MetaData {
    name: String,
    role: Int,
    email: String,
    user: User,
    group: Group
  }

  input MetaDataInput {
    name: String!,
    role: Int!,
    group: ID,
    email: String!
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
    activeGroup: ID,
    role: Int,
    id: ID
  }

  type Token {
    token: String!,
    status: Int,
    type: Int!,
    metaData: MetaData,
    user: User,
    url: String, 
    createdAt: String,
    updatedAt: String
  }

  type UserSettings {
    user: User!,
    invites: [Token],
    canInvite: [Int]
  }

`;