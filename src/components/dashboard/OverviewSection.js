import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  Wallet,
  HandCoins,
  CheckCircle,
  XCircle,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function OverviewSection({ agentData }) {
  const [activeTab, setActiveTab] = useState("mtn");

  // Tracking states for inline editing
  const [editingKey, setEditingKey] = useState(null); // stores the currently editing package key
  const [editValue, setEditValue] = useState(""); // stores current input value string
  const [isSaving, setIsSaving] = useState(false);

  const getCarrierFieldAndPackages = () => {
    if (activeTab === "mtn")
      return {
        fieldName: "mtnPackages",
        packages: agentData?.mtnPackages || {},
      };
    if (activeTab === "vodafone")
      return {
        fieldName: "vodafonePackages",
        packages: agentData?.vodafonePackages || {},
      };
    return {
      fieldName: "airteltigoPackages",
      packages: agentData?.airteltigoPackages || {},
    };
  };

  const { fieldName, packages: activePackages } = getCarrierFieldAndPackages();

  const startEditing = (key, initialPrice) => {
    setEditingKey(key);
    setEditValue(initialPrice ? initialPrice.toString() : "0.00");
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const savePrice = async (key) => {
    const numericPrice = parseFloat(editValue);
    if (isNaN(numericPrice) || numericPrice < 0) {
      alert("Please specify a valid numeric selling price.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, "echoagents", user.uid);

      // Target specific map field in Firestore using dot notation
      // example update string path: "mtnPackages.pkg_1gb.agentPrice"
      await updateDoc(docRef, {
        [`${fieldName}.${key}.agentPrice`]: numericPrice,
      });

      // Optimistically update local parent memory reference if needed,
      // or rely on a wrapper snapshot real-time listener if you have one attached.
      activePackages[key].agentPrice = numericPrice;

      setEditingKey(null);
    } catch (err) {
      console.error("Failed to commit price configuration:", err);
      alert("Could not update agent price. Verify your permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Financial Dashboard Tiles */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs text-slate-500 font-mono block uppercase tracking-wider">
              Wallet Balance
            </span>
            <span className="text-3xl font-black font-mono text-white">
              GHS {agentData?.walletBalance?.toFixed(2) || "0.00"}
            </span>
          </div>
          <Wallet className="h-8 w-8 text-emerald-400/20" />
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs text-slate-500 font-mono block uppercase tracking-wider">
              Withdrawable Earnings
            </span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              GHS {agentData?.withdrawableEarnings?.toFixed(2) || "0.00"}
            </span>
          </div>
          <HandCoins className="h-8 w-8 text-emerald-400/20" />
        </div>
      </div>

      {/* Package Configuration Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <h2 className="text-base font-bold text-white">
              Data Provisioning Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live view of network sizes and profit profiles setup across Ghana.
              Click the icon to set custom client resell prices.
            </p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
            {["mtn", "vodafone", "airteltigo"].map((carrier) => (
              <button
                key={carrier}
                onClick={() => {
                  setActiveTab(carrier);
                  cancelEditing();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase ${activeTab === carrier ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"}`}
              >
                {carrier === "vodafone"
                  ? "Telecel"
                  : carrier === "airteltigo"
                    ? "AT"
                    : carrier}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-xs font-mono uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-4">Package Volume</th>
                <th className="p-4">Cost Price (Base API)</th>
                <th className="p-4">Agent Resell Price</th>
                <th className="p-4">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {Object.keys(activePackages).map((key) => {
                const pkg = activePackages[key];
                const isCurrentItemEditing = editingKey === key;

                return (
                  <tr
                    key={key}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="p-4 font-bold text-slate-200">{pkg.size}</td>
                    <td className="p-4 font-mono text-slate-400">
                      GHS {pkg.costPrice?.toFixed(2)}
                    </td>

                    {/* INLINE EDITING MATRIX FIELD */}
                    <td className="p-4 font-mono text-emerald-400 font-semibold min-w-[180px]">
                      {isCurrentItemEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">GHS</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            disabled={isSaving}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
                          />
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                          ) : (
                            <>
                              <button
                                onClick={() => savePrice(key)}
                                className="p-1 hover:bg-emerald-500/10 text-emerald-400 rounded transition-all"
                                title="Commit Price Changes"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-all"
                                title="Cancel Action"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span>GHS {pkg.agentPrice?.toFixed(2)}</span>
                          <button
                            onClick={() => startEditing(key, pkg.agentPrice)}
                            className="p-1 text-slate-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-slate-800/60"
                            title="Modify Resell Tier"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {pkg.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
                          <CheckCircle className="h-3.5 w-3.5" /> Functional
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/5 px-2.5 py-1 rounded-md border border-red-500/10">
                          <XCircle className="h-3.5 w-3.5" /> Offline
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
