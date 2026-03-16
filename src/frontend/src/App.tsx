import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import DashboardLayout from "./pages/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import * as LocalStore from "./utils/LocalStore";

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("kuber_user_email"),
  );

  const handleLogin = (email: string) => {
    localStorage.setItem("kuber_user_email", email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("kuber_user_email");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const email = localStorage.getItem("kuber_user_email") ?? "";
    if (email.toLowerCase() === ADMIN_EMAIL) return;
    const users = LocalStore.getRegisteredUsers();
    if (!users.find((u) => u.email === email)) {
      handleLogout();
    }
  });

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
