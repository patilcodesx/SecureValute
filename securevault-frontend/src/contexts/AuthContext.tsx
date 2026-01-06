// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

/* ===================== TYPES ===================== */

interface Session {
  id: string | number;
  userId: string | number;
  device: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityAlert {
  id: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  isRead: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  details: string;
}

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;

  sessions: Session[];
  activityLogs: ActivityLog[];
  securityAlerts: SecurityAlert[];

  reloadSessions: () => Promise<void>;
  reloadActivity: () => Promise<void>;
  markAlertRead: (id: string) => void;

  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;

  addActivityLog: (
    action: string,
    details: string,
    severity?: string
  ) => Promise<void>;

  enable2FA: () => Promise<string | null>;
  disable2FA: () => Promise<void>;

  getAllUsers: () => any[];
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeParse = (val: string | null, fallback: any) => {
  try {
    return JSON.parse(val || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

/* ===================== PROVIDER ===================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(
    safeParse(localStorage.getItem("securevault_user"), null)
  );

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("securevault_token")
  );

  const [isLoading, setIsLoading] = useState(true);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(
    safeParse(localStorage.getItem("securevault_alerts"), [])
  );

  // Teams module placeholder
  const [allUsers, setAllUsers] = useState<any[]>([]);

  /* ===================== INIT ===================== */

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    reloadSessions();
    reloadActivity();
    loadUsers();

    setIsLoading(false);
  }, [token]);

  /* ===================== USERS ===================== */
  // Backend does NOT have /api/users → avoid 404
  const loadUsers = async () => {
    setAllUsers([]);
    return [];
  };

  /* ===================== SESSIONS ===================== */

  const reloadSessions = async () => {
    if (!token) return;

    try {
      const data = await apiFetch("/sessions", { method: "GET" });
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    }
  };

  /* ===================== ACTIVITY ===================== */

  const reloadActivity = async () => {
    if (!token) return;

    try {
      const data = await apiFetch("/activity", { method: "GET" });
      setActivityLogs(Array.isArray(data) ? data : []);
    } catch {
      setActivityLogs([]);
    }
  };

  /* ===================== ALERTS ===================== */

  const markAlertRead = (id: string) => {
    const updated = securityAlerts.map((a) =>
      a.id === id ? { ...a, isRead: true } : a
    );
    setSecurityAlerts(updated);
    localStorage.setItem("securevault_alerts", JSON.stringify(updated));
  };

  /* ===================== LOGIN ===================== */

  const login = async (email: string, password: string) => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.success === false) {
        return { success: false, error: data.message };
      }

      const loggedUser = {
        email: data.email,
        name: data.name,
        role: data.role,
      };

      setToken(data.token);
      setUser(loggedUser);

      localStorage.setItem("securevault_token", data.token);
      localStorage.setItem(
        "securevault_user",
        JSON.stringify(loggedUser)
      );

      await reloadSessions();
      await reloadActivity();

      return { success: true };
    } catch {
      return { success: false, error: "Server error" };
    }
  };

  /* ===================== SIGNUP ===================== */

  const signup = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });

      return data.success
        ? { success: true }
        : { success: false, error: data.message };
    } catch {
      return { success: false, error: "Server error" };
    }
  };

  /* ===================== ACTIVITY LOG ===================== */

  const addActivityLog = async (
    action: string,
    details: string,
    severity: string = "info"
  ) => {
    try {
      const payload = { action, details, severity };
      const res = await apiFetch("/activity", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const saved = res?.data || res;
      setActivityLogs((prev) => [saved, ...prev]);
    } catch {}
  };

  /* ===================== 2FA ===================== */

  const enable2FA = async (): Promise<string | null> => {
    try {
      const res = await apiFetch("/auth/2fa/enable", {
        method: "POST",
      });

      const secret = res?.secret ?? null;

      const updated = { ...user, twoFactorEnabled: true };
      setUser(updated);
      localStorage.setItem(
        "securevault_user",
        JSON.stringify(updated)
      );

      addActivityLog("2fa_enable", "Enabled two-factor authentication");
      return secret;
    } catch {
      return null;
    }
  };

  const disable2FA = async () => {
    try {
      await apiFetch("/auth/2fa/disable", { method: "POST" });

      const updated = { ...user, twoFactorEnabled: false };
      setUser(updated);
      localStorage.setItem(
        "securevault_user",
        JSON.stringify(updated)
      );

      addActivityLog(
        "2fa_disable",
        "Disabled two-factor authentication"
      );
    } catch {}
  };

  /* ===================== LOGOUT ===================== */

  const logout = () => {
    localStorage.removeItem("securevault_token");
    localStorage.removeItem("securevault_user");

    setUser(null);
    setToken(null);
    setSessions([]);
    setActivityLogs([]);
    setSecurityAlerts([]);
    setAllUsers([]);
  };

  /* ===================== PROVIDER ===================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,

        sessions,
        activityLogs,
        securityAlerts,

        reloadSessions,
        reloadActivity,
        markAlertRead,

        login,
        signup,
        logout,

        enable2FA,
        disable2FA,
        addActivityLog,

        getAllUsers: () => allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ===================== HOOK ===================== */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
