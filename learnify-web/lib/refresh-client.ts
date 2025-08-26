import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Отдельный клиент для вызова refresh, чтобы он не зацикливался на errorLink
export function createRefreshClient() {
  return new ApolloClient({
    link: createHttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/graphql",
      credentials: "include",
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: "no-cache" },
      watchQuery: { fetchPolicy: "no-cache" },
    },
  });
}
