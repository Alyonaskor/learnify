import { gql } from "@apollo/client"

export const LOGIN_MUTATION = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      user {
        id
        email
        name
        createdAt
      }
      token
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
      token
    }
  }
`
