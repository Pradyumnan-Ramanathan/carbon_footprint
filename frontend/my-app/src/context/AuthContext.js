import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API = "http://localhost:5000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("auth_user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    // Persist non-sensitive user info for UI across page refreshes
    useEffect(() => {
        if (user) {
            localStorage.setItem("auth_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("auth_user");
        }
    }, [user]);

    const signup = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // sends/receives the httpOnly JWT cookie
                body: JSON.stringify({ name, email, password }),
            });
            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Could not parse server response. Please try again.");
            }
            if (!res.ok) throw new Error(data.message || "Registration failed");
            setUser({ name: data.user.name, email: data.user.email });
            return data;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // sends/receives the httpOnly JWT cookie
                body: JSON.stringify({ email, password }),
            });
            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Could not parse server response. Please try again.");
            }
            if (!res.ok) throw new Error(data.message || "Login failed");
            setUser({ name: data.user.name, email: data.user.email });
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API}/logout`, {
                method: "GET",
                credentials: "include",
            });
        } catch (e) {
            // ignore network errors on logout
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
