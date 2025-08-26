// apollo-client.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,

} from "@apollo/client";
import { onError } from "@apollo/client/link/error";



// HTTP линк — указывает, куда отправлять GraphQL-запросы
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/graphql",
  credentials: "include", // важно для отправки httpOnly cookie
});

// Обработка ошибок GraphQL и сети
const errorLink = onError(
  ({ graphQLErrors, networkError}) => {
    // Лог ошибок
  if (graphQLErrors) {
      graphQLErrors.forEach((err) => {
        console.error(
          `[GraphQL error]: Message: ${err.message}, Path: ${err.path}`
        );
      });
    }

    if (networkError) {
      console.error("[Network error]", networkError);
    }
  });

// Объединяем все линкы
export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
