import React, { useState } from "react";
import { db, auth } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  User,
  Mail,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
  Fingerprint,
  Activity,
  KeyRound,
  Lock,
} from "lucide-react";

export default function ProfileSection({ agentData, userId }) {
  const [storeName, setStoreName] = useState(agentData?.dataSellingName || "");
  const [supportPhone, setSupportPhone] = useState(
    agentData?.supportPhone || "",
  );
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Safeguard: Extract status safely or default it to active if missing
  const accountStatus = agentData?.status || "active";

  // Handles updating storefront details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdating(true);

    if (!storeName.trim()) {
      setError("Your website shop name cannot be blank.");
      setUpdating(false);
      return;
    }

    try {
      const docRef = doc(db, "echoagents", userId);

      // We clean the name so it can be safely used as a web URL address line
      const cleanStoreSlug = storeName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const updatePayload = {
        dataSellingName: cleanStoreSlug,
        supportPhone: supportPhone.trim(),
      };

      // Set missing status inside database if it wasn't there before
      if (!agentData?.status) {
        updatePayload.status = "active";
      }

      await updateDoc(docRef, updatePayload);
      setSuccess("Your profile updates have been saved successfully!");
      setStoreName(cleanStoreSlug);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to save your changes. Please check your internet connection.",
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handles safe password changing inside Firebase Auth
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordUpdating(true);

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      setPasswordUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Your new password must be at least 6 characters long.");
      setPasswordUpdating(false);
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setPasswordError(
        "Your session timed out. Please log out and back in again.",
      );
      setPasswordUpdating(false);
      return;
    }

    try {
      // Step 1: Re-authenticate user with old password for protection
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Step 2: Push new password to authentication services
      await updatePassword(user, newPassword);

      setPasswordSuccess("Your account login password has been changed!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setPasswordError("The current password you typed is incorrect.");
      } else {
        setPasswordError(
          "Failed to update password. Try logging out and back in first.",
        );
      }
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* SECTION TOP HEADER */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-400" /> My Profile Workspace
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your connection settings, update your website storefront names,
          and control your login password security.
        </p>
      </div>

      {/* FEEDBACK STATUS ALERTS */}
      {success && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-xl flex items-center gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SYSTEM READ-ONLY ACCESS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* User Account Identification ID */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500">
            <Fingerprint className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Your Account User ID
            </div>
            <div className="text-xs font-mono font-bold text-slate-300 mt-0.5 truncate select-all">
              {userId}
            </div>
          </div>
        </div>

        {/* Account Runtime Status Indicator */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Account Status
            </div>
            <div
              className={`text-xs font-bold mt-0.5 flex items-center gap-1.5 uppercase ${
                accountStatus === "active"
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${accountStatus === "active" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}
              />
              {accountStatus}
            </div>
          </div>
        </div>

        {/* System Registered Login Email */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Registered Email
            </div>
            <div className="text-xs font-bold text-slate-300 mt-0.5 truncate">
              {agentData?.email || "N/A"}
            </div>
          </div>
        </div>

        {/* System Account Node Permissions Rank */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Account Rank Level
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5 capitalize">
              {agentData?.role || "Standard Agent"}
            </div>
          </div>
        </div>
      </div>

      {/* EDITABLE CARD BLOCK ONE: PROFILE STORE DETAILS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <Building className="h-4 w-4 text-emerald-400" /> Storefront Shop
            Configuration
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
              Custom Store Address Name (Slug)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., acedata"
              disabled={updating}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white transition-all focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1.5 block leading-normal">
              Your public sales store link page will load at:{" "}
              <span className="text-emerald-400 font-bold font-mono">
                /store/{storeName || "your-name"}
              </span>
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
              Customer Support Help Phone Number
            </label>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="e.g., 0244123456"
              disabled={updating}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white transition-all focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {updating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Changes to Profile...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Profile Settings
              </>
            )}
          </button>
        </form>
      </div>

      {/* EDITABLE CARD BLOCK TWO: SECURE PASSWORD GENERATOR CHANGE PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <KeyRound className="h-4 w-4 text-emerald-400" /> Account Password
            Maintenance
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-xl flex items-center gap-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
              Current Account Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <input
                type="password"
                placeholder="Type your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordUpdating}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white transition-all focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                New Secure Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordUpdating}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white transition-all focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordUpdating}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white transition-all focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              passwordUpdating ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="w-full mt-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {passwordUpdating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                Updating Security Records...
              </>
            ) : (
              <>
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                Change Login Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
