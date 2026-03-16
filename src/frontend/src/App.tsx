import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import DashboardLayout from "./pages/DashboardLayout";
import LoginPage from "./pages/LoginPage";

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
