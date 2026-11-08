import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";

export type User = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await apiRequest<User>("/users/me");
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  function login(user: User) {
    setUser(user);
  }

  function updateUser(updates: Partial<User>) {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, ...updates } : currentUser,
    );
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, updateUser, logout }}
    >
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
