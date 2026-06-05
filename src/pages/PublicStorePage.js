import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Store,
  Wifi,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function PublicStorePage() {
  const { storeSlug } = useParams();
  const [agentId, setAgentId] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);

  const [allActivePackages, setAllActivePackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Form input field states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        setLoading(true);
        setError("");

        const agentsRef = collection(db, "echoagents");
        const q = query(agentsRef, where("dataSellingName", "==", storeSlug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("This store storefront is currently unavailable.");
          setLoading(false);
          return;
        }

        const agentDoc = querySnapshot.docs[0];
        const agentData = agentDoc.data();
        setAgentId(agentDoc.id);
        setStoreName(agentData.dataSellingName || "Echo Store");

        let loadedPlans = [];
        const networksList = [
          {
            name: "MTN",
            map: agentData.mtnPackages,
            color:
              "from-amber-500/20 to-amber-600/5 hover:border-amber-500/50 text-amber-400 border-amber-500/20",
          },
          {
            name: "Telecel",
            map: agentData.vodafonePackages,
            color:
              "from-red-500/20 to-red-600/5 hover:border-red-500/50 text-red-400 border-red-500/20",
          },
          {
            name: "AT",
            map: agentData.airteltigoPackages,
            color:
              "from-blue-500/20 to-blue-600/5 hover:border-blue-500/50 text-blue-400 border-blue-500/20",
          },
        ];

        networksList.forEach((net) => {
          if (net.map) {
            Object.keys(net.map).forEach((key) => {
              const plan = net.map[key];
              if (plan && plan.isActive === true) {
                loadedPlans.push({
                  id: key,
                  network: net.name,
                  size: plan.size || key.toUpperCase(),
                  customerPrice: parseFloat(plan.agentPrice || 0),
                });
              }
            });
          }
        });

        setAllActivePackages(loadedPlans);
      } catch (err) {
        console.error(err);
        setError("Could not parse data from server configuration assets.");
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug) fetchStorefrontData();
  }, [storeSlug]);

  useEffect(() => {
    if (!network) {
      setAvailablePackages([]);
      setSelectedPlanId("");
      return;
    }
    const filtered = allActivePackages.filter((p) => p.network === network);
    setAvailablePackages(filtered);
    setSelectedPlanId("");
  }, [network, allActivePackages]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phoneNumber || !network || !selectedPlanId) {
      setError("Please ensure all recipient fields are fully populated.");
      return;
    }

    setBuying(true);

    try {
      const selectedPlan = availablePackages.find(
        (p) => p.id === selectedPlanId,
      );
      if (!selectedPlan)
        throw new Error("The selected package option variant is invalid.");

      const response = await fetch(
        "https://us-central1-eustech-c4332.cloudfunctions.net/placeorder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: agentId,
            phoneNumber: phoneNumber,
            network: network,
            plan: selectedPlan.id,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || "Checkout request processing rejected.",
        );

      setSuccess(
        `Successfully sent ${selectedPlan.size} bundle to ${phoneNumber}!`,
      );
      setPhoneNumber("");
      setNetwork("");
      setSelectedPlanId("");
    } catch (err) {
      console.error(err);
      setError(err.message || "An expected error stalled checkout operations.");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-400 font-sans flex flex-col gap-3 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="text-xs font-mono tracking-widest text-slate-500">
          INITIALIZING_SECURE_STOREFRONT...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased relative overflow-x-hidden flex flex-col justify-between">
      {/* Decorative Blur Background Layer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-emerald-500/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="max-w-2xl w-full mx-auto px-4 py-12 md:py-20 z-10 my-auto space-y-8">
        {/* BRAND IDENTITY BANNER */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-slate-900 border border-slate-800 text-emerald-400 rounded-2xl shadow-xl">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight capitalize">
            {storeName}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Premium high-speed data fulfillment terminal. Enter credentials
            below to dispatch instant delivery networks.
          </p>
        </div>

        {/* FEEDBACK STATUS ALERTS */}
        {success && (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-sm rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* PREMIUM UNIFIED ORDER FORM */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            {/* INPUT FIELD: RECIPIENT PHONE NUMBER */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-500" /> Recipient
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g., 0244123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={buying}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3.5 text-sm font-mono text-white placeholder-slate-700 transition-all focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-xs">
                  GH
                </div>
              </div>
            </div>

            {/* SEGMENTED GRID SELECTOR: TELECOM PROVIDER */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-emerald-500" /> Select
                Network Provider
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "MTN",
                    label: "MTN",
                    activeClass:
                      "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10 text-amber-400",
                    defaultClass:
                      "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                  },
                  {
                    id: "Telecel",
                    label: "Telecel",
                    activeClass:
                      "border-red-500 ring-2 ring-red-500/20 bg-red-500/10 text-red-400",
                    defaultClass:
                      "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                  },
                  {
                    id: "AT",
                    label: "AT Network",
                    activeClass:
                      "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/10 text-blue-400",
                    defaultClass:
                      "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={buying}
                    onClick={() => setNetwork(item.id)}
                    className={`p-3.5 border rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 text-center justify-center ${network === item.id ? item.activeClass : item.defaultClass}`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC CARD TILES GRID: INTERACTIVE DATA PLAN PACKAGES */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-emerald-500" /> Choose Data
                Bundle Plan
              </label>

              {!network ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                  <p className="text-xs text-slate-500 font-medium">
                    Please select a network option above to reveal available
                    active data plans.
                  </p>
                </div>
              ) : availablePackages.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                  <p className="text-xs text-rose-400/70 font-medium">
                    No available data assets are loaded for this specific
                    provider channel currently.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {availablePackages.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        disabled={buying}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                            : "border-slate-800/80 bg-slate-950/50 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div
                            className={`text-base font-extrabold tracking-tight ${isSelected ? "text-emerald-400" : "text-white group-hover:text-emerald-400 transition-colors"}`}
                          >
                            {plan.size}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium tracking-wide uppercase">
                            {plan.network} Core
                          </div>
                        </div>
                        <div className="text-sm font-bold text-slate-200 font-mono">
                          GH₵ {plan.customerPrice.toFixed(2)}
                        </div>
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-bl-md flex items-center justify-center shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACTION DISPATCH TRIGGER SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={buying || !selectedPlanId || !phoneNumber}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-sm py-4 px-4 rounded-xl shadow-xl shadow-emerald-500/5 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-40"
            >
              {buying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Safe Checkout Route...
                </>
              ) : (
                <>
                  Confirm Secure Purchase Order
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <footer className="w-full text-center py-6 border-t border-slate-900/60 bg-slate-950/20 backdrop-blur-md">
        <p className="text-[10px] font-mono tracking-widest text-slate-600 uppercase">
          Secured with Acement.
        </p>
      </footer>
    </div>
  );
}
