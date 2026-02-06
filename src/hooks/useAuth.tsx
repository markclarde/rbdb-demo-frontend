import * as React from "react";
import { login as loginRequest } from "@/api/auth";
import { http } from "@/api/http";

type User = {
  id: number;
  username: string;
  role: string;
  permissions: string[];
  branch_id: number;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    branchId: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  const isAuthenticated = !!user;

  const fetchMe = React.useCallback(async () => {
    try {
      const user = await http.get<User>("/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = React.useCallback(
    async (email: string, password: string, branchId: number) => {
      await loginRequest({
        username: email,
        password,
        branch_id: branchId,
      });

      await fetchMe();
    },
    [fetchMe]
  );

  const logout = React.useCallback(async () => {
    await http.post("/auth/logout");
    setUser(null);
  }, []);

  const can = React.useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
