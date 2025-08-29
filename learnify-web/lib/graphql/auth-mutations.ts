import { gql } from "@apollo/client"

export const REGISTER_MUTATION = gql`
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      user {
        id
        email
        name
        createdAt
      }
      accessToken
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($data: LoginInput!) {
    login(input: $data) {
      user {
        id
        email
        name
        createdAt
      }
      accessToken
      refreshToken
    }
  }
`
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      name
      createdAt
    }
  }
`;

export const REFRESH_TOKENS_MUTATION = gql`
mutation Refresh {
  refresh {
    accessToken
  }
}
`
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`