import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import DashboardLayout from "./pages/DashboardLayout";
import LoginPage from "./pages/LoginPage";

const LOGO1 = "/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png";
const LOGO2 = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

function LoadingScreen() {
  const [src, setSrc] = useState(LOGO1);
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
    >
      {!failed ? (
        <img
          src={src}
          alt="KUBER PANEL"
          loading="eager"
          onError={() => {
            if (src === LOGO1) setSrc(LOGO2);
            else setFailed(true);
          }}
          style={{
            width: 88,
            height: 88,
            objectFit: "contain",
            filter: "drop-shadow(0 0 20px rgba(212,160,23,0.6))",
          }}
        />
      ) : (
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#d4a017,#f0c040)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 900,
            color: "#000",
          }}
        >
          K
        </div>
      )}
      <div
        className="mt-5 text-xl font-black tracking-[0.2em]"
        style={{
          background: "linear-gradient(135deg,#f0c040,#d4a017,#f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
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
              background: "#d4a017",
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
    // Brief 500ms splash then check auth
    const t = setTimeout(() => {
      setIsLoggedIn(checkLoggedIn());
      setInitializing(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(checkLoggedIn());
  };

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

  if (initializing) {
    return <LoadingScreen />;
  }

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
