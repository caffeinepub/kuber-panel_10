import {
  Activity,
  ArrowLeft,
  Building2,
  Camera,
  CheckSquare,
  Code2,
  Coins,
  FileText,
  Gamepad2,
  HelpCircle,
  History,
  KeyRound,
  MoreVertical,
  Shuffle,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import StableLogo from "../components/StableLogo";
import { useApp } from "../context/AppContext";
import ActivationPanel from "./sections/ActivationPanel";
import AddBankAccount from "./sections/AddBankAccount";
import AccountStatement from "./sections/BankStatement";
import DashboardHome from "./sections/DashboardHome";
import FundSection from "./sections/FundSection";
import HelpSupport from "./sections/HelpSupport";
import LiveFundActivity from "./sections/LiveFundActivity";
import MyCommission from "./sections/MyCommission";
import WithdrawalHistory from "./sections/WithdrawalHistory";
import WithdrawalSection from "./sections/WithdrawalSection";
import BankApproval from "./sections/admin/BankApproval";
import ChangeSupportLink from "./sections/admin/ChangeSupportLink";
import GeneratedCode from "./sections/admin/GeneratedCode";
import UserManagement from "./sections/admin/UserManagement";

const menuItems = [
  { id: "dashboard", label: "Dashboard", Icon: Building2 },
  { id: "add-bank", label: "Add Bank Account", Icon: Building2 },
  { id: "bank-statement", label: "Bank Statement", Icon: FileText },
  { id: "gaming-fund", label: "Gaming Fund (15%)", Icon: Gamepad2 },
  { id: "stock-fund", label: "Stock Fund (30%)", Icon: TrendingUp },
  { id: "mix-fund", label: "Mix Fund (25%)", Icon: Shuffle },
  { id: "political-fund", label: "Political Fund (30%)", Icon: Vote },
  { id: "commission", label: "My Commission", Icon: Coins },
  { id: "live-activity", label: "Live Fund Activity", Icon: Activity },
  { id: "withdrawal", label: "Withdrawal", Icon: History },
  { id: "withdrawal-history", label: "Withdrawal History", Icon: History },
  { id: "activation", label: "Activation Panel", Icon: KeyRound },
  { id: "help-support", label: "Help & Support", Icon: HelpCircle },
];

const adminMenuItems = [
  { id: "generated-code", label: "Generated Codes", Icon: Code2 },
  { id: "user-management", label: "User Management", Icon: Users },
  { id: "bank-approval", label: "Bank Approval", Icon: CheckSquare },
  { id: "change-support", label: "Change Support Link", Icon: HelpCircle },
];

export default function DashboardLayout() {
  const { isAdmin, activeSection, setActiveSection, userEmail, logout } =
    useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Profile photo stored in localStorage per user
  const photoKey = `kuber_profile_photo_${userEmail}`;
  const [profilePhoto, setProfilePhoto] = useState<string>(
    () => localStorage.getItem(photoKey) || "",
  );

  const isOnDashboard = activeSection === "dashboard";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem(photoKey, dataUrl);
      setProfilePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "add-bank":
        return <AddBankAccount />;
      case "bank-statement":
        return <AccountStatement />;
      case "gaming-fund":
        return <FundSection fundType="gaming" commission={15} />;
      case "stock-fund":
        return <FundSection fundType="stock" commission={30} />;
      case "mix-fund":
        return <FundSection fundType="mix" commission={25} />;
      case "political-fund":
        return <FundSection fundType="political" commission={30} />;
      case "commission":
        return <MyCommission />;
      case "live-activity":
        return <LiveFundActivity />;
      case "withdrawal":
        return <WithdrawalSection />;
      case "withdrawal-history":
        return <WithdrawalHistory />;
      case "activation":
        return <ActivationPanel />;
      case "help-support":
        return <HelpSupport />;
      case "generated-code":
        return <GeneratedCode />;
      case "user-management":
        return <UserManagement />;
      case "bank-approval":
        return <BankApproval />;
      case "change-support":
        return <ChangeSupportLink />;
      default:
        return <DashboardHome />;
    }
  };

  const sectionTitle = (() => {
    const all = [...menuItems, ...adminMenuItems];
    return all.find((m) => m.id === activeSection)?.label ?? "Dashboard";
  })();

  const userInitial = (userEmail?.[0] ?? "U").toUpperCase();

  const BTN = 36;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#000000", color: "#fff" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-3 py-2"
        style={{
          background: "#050a10",
          borderBottom: "1px solid rgba(0,200,255,0.12)",
        }}
      >
        {/* Left: 3-dot menu on dashboard; back button in sub-sections */}
        <div className="relative" ref={menuRef}>
          {isOnDashboard ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                data-ocid="header.menu_button"
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{
                  width: BTN,
                  height: BTN,
                  background: menuOpen
                    ? "rgba(0,200,255,0.12)"
                    : "rgba(0,200,255,0.05)",
                  border: "1px solid rgba(0,200,255,0.28)",
                  boxShadow: "0 0 10px rgba(0,200,255,0.08)",
                }}
              >
                <MoreVertical
                  className="w-4 h-4"
                  style={{ color: "rgba(0,200,255,0.9)" }}
                />
              </button>

              {/* Menu Dropdown */}
              {menuOpen && (
                <div
                  className="absolute left-0 top-11 w-64 rounded-2xl overflow-hidden shadow-2xl z-50"
                  style={{
                    background: "oklch(0.08 0.015 220)",
                    border: "1px solid oklch(0.65 0.15 220 / 25%)",
                  }}
                  data-ocid="header.dropdown_menu"
                >
                  {/* KUBER PANEL branding header inside dropdown */}
                  <div
                    className="px-4 py-3 flex items-center gap-2.5"
                    style={{ borderBottom: "1px solid rgba(0,200,255,0.1)" }}
                  >
                    <StableLogo size={44} />
                    <div>
                      <div className="text-xs font-black tracking-[0.2em] shimmer-text">
                        KUBER PANEL
                      </div>
                      <div className="text-[9px] text-gray-600 tracking-widest">
                        OFFICIAL PLATFORM
                      </div>
                    </div>
                  </div>

                  <div className="py-1 max-h-[65vh] overflow-y-auto">
                    {menuItems.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActiveSection(id as any);
                          setMenuOpen(false);
                        }}
                        data-ocid={`menu.${id.replace(/-/g, "_")}.link`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                        style={{
                          color:
                            activeSection === id
                              ? "oklch(0.8 0.17 85)"
                              : "#ccc",
                          background:
                            activeSection === id
                              ? "oklch(0.75 0.15 85 / 8%)"
                              : "transparent",
                        }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}

                    {isAdmin && (
                      <>
                        <div
                          className="mx-4 my-1 h-px"
                          style={{
                            background: "oklch(0.65 0.15 220 / 15%)",
                          }}
                        />
                        <div className="px-4 py-1">
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: "oklch(0.65 0.2 220)" }}
                          >
                            Admin Panel
                          </span>
                        </div>
                        {adminMenuItems.map(({ id, label, Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setActiveSection(id as any);
                              setMenuOpen(false);
                            }}
                            data-ocid={`menu.${id.replace(/-/g, "_")}.link`}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                            style={{
                              color:
                                activeSection === id
                                  ? "oklch(0.8 0.2 220)"
                                  : "#bbb",
                              background:
                                activeSection === id
                                  ? "oklch(0.65 0.2 220 / 8%)"
                                  : "transparent",
                            }}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{label}</span>
                          </button>
                        ))}
                      </>
                    )}

                    <div
                      className="mx-4 my-1 h-px"
                      style={{ background: "oklch(0.5 0.2 25 / 20%)" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      data-ocid="menu.logout.button"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm"
                      style={{ color: "oklch(0.65 0.2 25)" }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Back button — theme cyan colour */
            <button
              type="button"
              onClick={() => setActiveSection("dashboard")}
              data-ocid="header.back_button"
              className="flex items-center justify-center rounded-xl transition-colors"
              style={{
                width: BTN,
                height: BTN,
                background: "rgba(0,200,255,0.08)",
                border: "1px solid rgba(0,200,255,0.28)",
                boxShadow: "0 0 8px rgba(0,200,255,0.08)",
              }}
            >
              <ArrowLeft
                className="w-4 h-4"
                style={{ color: "rgba(0,200,255,0.9)" }}
              />
            </button>
          )}
        </div>

        {/* Center: empty on dashboard; section title in sub-sections */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2">
          {!isOnDashboard && (
            <span className="text-sm font-bold text-white truncate max-w-[160px]">
              {sectionTitle}
            </span>
          )}
        </div>

        {/* Right: user avatar circle */}
        <div className="relative" ref={userMenuRef}>
          {/* Hidden file input for profile photo */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
            data-ocid="header.photo_upload_button"
          />
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            data-ocid="header.user_button"
            className="flex items-center justify-center rounded-full transition-all overflow-hidden font-black"
            style={{
              width: BTN,
              height: BTN,
              background: profilePhoto
                ? "transparent"
                : userMenuOpen
                  ? "rgba(0,200,255,0.1)"
                  : "transparent",
              border: "1.5px solid rgba(0,200,255,0.35)",
              boxShadow: "0 0 12px rgba(0,200,255,0.12)",
              color: "rgba(0,200,255,0.9)",
              fontSize: 14,
              padding: 0,
            }}
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                style={{
                  width: BTN,
                  height: BTN,
                  objectFit: "cover",
                  borderRadius: "50%",
                  display: "block",
                }}
              />
            ) : (
              userInitial
            )}
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 top-11 w-56 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{
                background: "oklch(0.08 0.015 220)",
                border: "1px solid oklch(0.65 0.15 220 / 25%)",
              }}
              data-ocid="header.user_dropdown"
            >
              {/* Profile photo section */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  type="button"
                  className="relative flex-shrink-0 rounded-full overflow-hidden cursor-pointer"
                  style={{
                    width: 44,
                    height: 44,
                    border: "2px solid rgba(0,200,255,0.35)",
                    background: profilePhoto
                      ? "transparent"
                      : "rgba(0,200,255,0.08)",
                    padding: 0,
                  }}
                  onClick={() => photoInputRef.current?.click()}
                  title="Change profile photo"
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-black text-lg"
                      style={{ color: "rgba(0,200,255,0.9)" }}
                    >
                      {userInitial}
                    </div>
                  )}
                  {/* Camera overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] font-bold truncate"
                    style={{ color: "oklch(0.8 0.17 85)" }}
                  >
                    {userEmail || "User"}
                  </div>
                  <div className="text-[9px] text-gray-600">
                    {isAdmin ? "Administrator" : "Member"}
                  </div>
                  <button
                    type="button"
                    className="text-[9px] mt-0.5"
                    style={{ color: "rgba(0,200,255,0.7)" }}
                    onClick={() => photoInputRef.current?.click()}
                    data-ocid="header.change_photo_button"
                  >
                    Change Photo
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      className="text-[9px] mt-0.5"
                      style={{ color: "rgba(255,80,80,0.7)" }}
                      onClick={() => {
                        localStorage.removeItem(photoKey);
                        setProfilePhoto("");
                      }}
                      data-ocid="header.remove_photo_button"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                style={{ color: "oklch(0.65 0.2 25)" }}
                data-ocid="header.logout.button"
              >
                <ArrowLeft className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-5 pb-8 max-w-lg mx-auto w-full">
        {renderSection()}
      </main>

      <footer
        className="text-center py-3 text-[10px]"
        style={{ color: "oklch(0.4 0 0)" }}
      >
        KUBER PANEL &middot; Licensed Financial Dashboard
      </footer>
    </div>
  );
}
