import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Profile } from "@/types";

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

const CACHE_KEY = "cached_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  const saveProfile = (p: Profile | null) => {
    setProfile(p);
    if (p) localStorage.setItem(CACHE_KEY, JSON.stringify(p));
    else localStorage.removeItem(CACHE_KEY);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Profile }>("/api/auth/me");
      saveProfile(res.data);
    } catch {
      saveProfile(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setLoading(false);
      refreshProfile().finally(() => setLoading(false));
    } else {
      saveProfile(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{
      success: boolean;
      data: { access_token: string; user: Profile };
    }>("/api/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.access_token);
    saveProfile(res.data.user);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => {
    await api.post("/api/auth/register", {
      email,
      password,
      full_name: fullName,
      role,
    });
  };

  const logout = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem(CACHE_KEY);
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ profile, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
