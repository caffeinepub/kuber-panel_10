import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DashboardLayout from "./pages/DashboardLayout";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <div className="text-center">
          <img
            src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
            alt="Kuber Panel"
            className="w-24 h-24 mx-auto mb-4 opacity-80"
          />
          <div className="gold-text text-xl font-bold tracking-widest">
            KUBER PANEL
          </div>
          <div className="text-sm text-gray-500 mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {identity ? (
        <AppProvider>
          <DashboardLayout />
        </AppProvider>
      ) : (
        <LoginPage />
      )}
      <Toaster theme="dark" />
    </>
  );
}
