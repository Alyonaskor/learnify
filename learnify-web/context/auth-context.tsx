"use client";

import type React from "react";
import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { User, AuthState } from "@/types/auth";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation"; // или next/router, если у тебя pages-router
import { LOGOUT_MUTATION,  ME_QUERY } from "@/lib/graphql/auth-mutations";

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  logoutLoading: boolean;
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
  const client = useApolloClient();
  const router = useRouter();

  // Запрос текущего пользователя при монтировании (куки отправляются автоматически)
  //    fetchPolicy: 'network-only' чтобы не брать stale кэш
  const { loading: meLoading } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
    onError: () => {
      dispatch({ type: "INITIALIZE", payload: { user: null } });
    },
    onCompleted: (data) => {
        dispatch({ type: "INITIALIZE", payload: { user: data?.me ?? null  } });  
    },
  });

    // 2) Мутация logout. ВАЖНО: слать куки (credentials: 'include').
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION, {
    context: { fetchOptions: { credentials: "include" } 
    },
  });

  const login = useCallback((user: User) => {
    dispatch({ type: "LOGIN", payload: { user } });
  }, []);

// 3) Единый выход: вызываем мутацию, очищаем кэш, редиректим.
const logout = useCallback(async () => {
  try {
    await logoutMutation();
  } catch {
    // игнор ошибок — logout идемпотентный, всё равно чистим клиент
  } finally {
    dispatch({ type: "LOGOUT" });
    // чистим кэш, чтобы 'me' и другие запросы стали неавторизованными на клиенте
    await client.clearStore();
    router.push("/login");
  }
}, [logoutMutation, client, router]);

 const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setLoading,
    logoutLoading,
  };

  // Пока идёт первый запрос me — показываем isLoading
  useEffect(() => {
    if (meLoading) {
      dispatch({ type: "SET_LOADING", payload: true });
    }
  }, [meLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
