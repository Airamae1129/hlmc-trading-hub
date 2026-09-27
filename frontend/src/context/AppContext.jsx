import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

/* ---------------- theme ---------------- */
const ThemeCtx = createContext({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("hesi-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("hesi-theme", theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return <ThemeCtx.Provider value={{ theme, toggleTheme }}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);

/* ---------------- inquiry list (cart) ---------------- */
const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hesi-inquiry-list") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("hesi-inquiry-list", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, sample = false) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id && p.sample === sample)) return prev;
      return [...prev, { id: product.id, name: product.name, category: product.category, sample }];
    });
  }, []);
  const removeItem = useCallback((id, sample) => {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.sample === sample)));
  }, []);
  const clearItems = useCallback(() => setItems([]), []);

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, clearItems, count: items.length }}>
      {children}
    </CartCtx.Provider>
  );
}
export const useCart = () => useContext(CartCtx);

/* ---------------- admin auth ---------------- */
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = logged out
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(false));
  }, []);
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    return res.data;
  }, []);
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(false);
  }, []);
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
