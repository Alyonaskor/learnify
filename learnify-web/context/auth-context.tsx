/**
 * AuthContext — централизованное управление состоянием авторизации.
 *
 * Важно:
 * 1. Мы используем cookie-based JWT (httpOnly cookies), поэтому access_token и refresh_token
 *    хранятся только в браузерных куках и недоступны из JavaScript (повышает безопасность от XSS).
 * 2. Токен не сохраняется в localStorage / state на фронтенде — единственный источник правды о пользователе
 *    это бекенд, через GraphQL-запрос `me`.
 * 3. При загрузке приложения `AuthProvider` вызывает `ME_QUERY`, чтобы проверить, авторизован ли пользователь.
 *    - Если куки с access_token валидны → бекенд вернёт данные пользователя → сохраняем в state.
 *    - Если куки отсутствуют или токен недействителен → бекенд вернёт ошибку → user = null.
 * 4. Логаут (`logout`) вызывает соответствующую GraphQL-мутацию, которая удаляет куки на бекенде.
 *    После этого пользователь считается неавторизованным.
 *
 * Преимущества подхода:
 * - Нет токена в localStorage/sessionStorage → меньше поверхность атаки.
 * - Логика авторизации полностью контролируется бекендом.
 * - Простой механизм обновления access_token через refresh_token, если он есть в куках.
 */

"use client";

import type React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";
import type { User, AuthState } from "@/types/auth";
import { useQuery, useMutation } from "@apollo/client";
import { ME_QUERY } from "@/lib/graphql/me-query";
import { LOGOUT_MUTATION } from "@/lib/graphql/mutations";

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "INITIALIZE"; payload: { user: User | null } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "INITIALIZE":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Запрос текущего пользователя при монтировании (куки отправляются автоматически)
  const { loading } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
    onError: () => {
      dispatch({ type: "INITIALIZE", payload: { user: null } });
    },
    onCompleted: (data) => {
      if (data?.me) {
        dispatch({ type: "INITIALIZE", payload: { user: data.me } });
      }
    },
  });

  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      dispatch({ type: "LOGOUT" });
    },
  });

  const login = (user: User) => {
    dispatch({ type: "LOGIN", payload: { user } });
  };

  const logout = () => {
    logoutMutation();
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setLoading,
  };

  // Пока идёт первый запрос me — показываем isLoading
  useEffect(() => {
    if (loading) {
      dispatch({ type: "SET_LOADING", payload: true });
    }
  }, [loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
