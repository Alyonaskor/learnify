import { gql } from "@apollo/client"

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
