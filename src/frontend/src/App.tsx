import { useEffect, useState } from "react";
import StableLogo from "./components/StableLogo";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import DashboardLayout from "./pages/DashboardLayout";
import LoginPage from "./pages/LoginPage";

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
    >
      <StableLogo size={88} glow />
      <div className="mt-5 text-xl font-black tracking-[0.2em] shimmer-text">
        KUBER PANEL
      </div>
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "oklch(0.65 0.2 220)",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function checkLoggedIn() {
  return (
    !!localStorage.getItem("kuber_admin_fallback") ||
    !!localStorage.getItem("kuber_logged_in_user")
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsLoggedIn(checkLoggedIn());
      setInitializing(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = () => setIsLoggedIn(checkLoggedIn());

  const handleLogout = () => {
    localStorage.removeItem("kuber_admin_fallback");
    localStorage.removeItem("kuber_admin_fallback_email");
    localStorage.removeItem("kuber_user_email");
    localStorage.removeItem("kuber_logged_in_user");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("selectstart", prevent);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("selectstart", prevent);
    };
  }, []);

  if (initializing) return <LoadingScreen />;

  return (
    <>
      {isLoggedIn ? (
        <AppProvider onLogout={handleLogout}>
          <DashboardLayout />
        </AppProvider>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster theme="dark" />
    </>
  );
}
