// apollo-client.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
  Operation,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { createRefreshClient } from "./refresh-client";
import { REFRESH_TOKENS_MUTATION } from "./graphql/auth-mutations";



// HTTP link - specifies where to send GraphQL queries
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/graphql",
  credentials: "include", // important to send httpOnly cookie
});

const refreshClient = createRefreshClient();

// --- queue during refresh ---
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((cb) => cb());
  pendingRequests = [];
};
const addPendingRequest = (cb: () => void) => {
  pendingRequests.push(cb);
};

const isSkippableOperation = (operation: Operation) => {
  const name = operation.operationName || "";
  const { skipRefresh } = (operation.getContext() as any) || {};
  return skipRefresh || name === "Refresh";
};


let refreshFailed = false;
// GraphQL and Network Error Handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // лог — как был
  if (graphQLErrors?.length) {
    graphQLErrors.forEach((err) => {
      console.error(`[GraphQL error]: ${err.message}`, { path: err.path, code: err.extensions?.code });
    });
  }
  if (networkError) {
    console.error("[Network error]:", networkError);
  }

  // признак 401/UNAUTHENTICATED
  const isUnauthGql = graphQLErrors?.some((e) => e?.extensions?.code === "UNAUTHENTICATED") ?? false;
  const statusCode = (networkError as any)?.statusCode;
  const isUnauthNetwork = statusCode === 401;

  // если уже на /login|/register — не редиректим и не пытаемся refresh бесконечно
  const isAuthRoute =
    typeof window !== "undefined" &&
    (/^\/login\/?$/.test(window.location.pathname) || /^\/register\/?$/.test(window.location.pathname));

  // пропускаем refresh если он уже фейлился, или операция помечена как skip, или это не 401/UNAUTH
  const needRefresh =
  !refreshFailed &&
  !isAuthRoute && // <— не рефрешимся на /login и /register
  (isUnauthGql || isUnauthNetwork) &&
  !isSkippableOperation(operation);

  if (!needRefresh) {
    // важно продолжить цепочку
    return forward(operation);
  }

  // если рефреш уже идёт — ставим запрос в очередь
  if (isRefreshing) {
    return new Observable((observer) => {
      addPendingRequest(() => {
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      });
    });
  }

  // стартуем refresh
  isRefreshing = true;

  return new Observable((observer) => {
    refreshClient
      .mutate({
        mutation: REFRESH_TOKENS_MUTATION, // mutation Refresh { refresh { accessToken } }
        context: { skipRefresh: true },    // чтобы не перехватывать сам себя
        fetchPolicy: "no-cache",
      })
      .then(({ data }) => {
        const newAccess = data?.refresh?.accessToken;
        if (newAccess) {
          // refresh прошёл — сбрасываем флаг и будим очередь
          refreshFailed = false;
          resolvePendingRequests();
          //сразу обновляем все активные useQuery (включая ME_QUERY) уже с новым access_token
          void apolloClient.reFetchObservableQueries();

          // повторяем исходный запрос
          forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        } else {
          // нет токена — считаем фатальным
          refreshFailed = true;
          pendingRequests = [];
          if (!isAuthRoute && typeof window !== "undefined") {
            window.location.href = "/login";
          }
          observer.error(new Error("Refresh failed: no accessToken"));
        }
      })
      .catch((err) => {
        console.error("Refresh error:", err);
        refreshFailed = true;
        pendingRequests = [];
        if (!isAuthRoute && typeof window !== "undefined") {
          window.location.href = "/login";
        }
        observer.error(err);
      })
      .finally(() => {
        isRefreshing = false;
      });
  });
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
