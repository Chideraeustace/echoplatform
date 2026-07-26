import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SmartphoneNfc,
  ArrowRight,
  Database,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Search,
  Clock,
  RefreshCw,
  PackageCheck,
} from "lucide-react";
// NOTE: adjust this import to wherever your Firebase app is initialized.
// `db` should be a modular (v9) Firestore instance, e.g.
// `export const db = getFirestore(app);`
import { db } from "../firebase";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

// TODO: point this at the cloud function / API endpoint that will initiate
// payment (e.g. a Firebase HTTPS function URL like
// "https://us-central1-<project-id>.cloudfunctions.net/initiatePayment").
const INITIATE_PAYMENT_URL =
  "https://us-central1-eustech-c4332.cloudfunctions.net/initiatePaymentFront";

// TODO: update to your real support line.0572004011
const CONTACT_PHONE = "+233572004011";
const CONTACT_PHONE_DISPLAY = "+233 57 200 4011";

// Domains where customers buy bundles — agent sign up/login stays hidden
// here. Add any other customer-facing domains (e.g. www. variant) to this
// list. Keep this in sync with the CUSTOMER_ONLY_DOMAINS list in App.jsx.
const CUSTOMER_ONLY_DOMAINS = ["echodata.xyz", "www.echodata.xyz"];

const isAgentPortalDomain = () => {
  if (typeof window === "undefined") return true; // fallback for SSR/build time
  return !CUSTOMER_ONLY_DOMAINS.includes(window.location.hostname);
};

const NETWORKS = [
  {
    id: "mtn",
    label: "MTN",
    accent: "text-yellow-400",
    ring: "ring-yellow-400/40",
    bg: "bg-yellow-400/10",
  },
  {
    id: "tigo",
    label: "AirtelTigo",
    accent: "text-blue-400",
    ring: "ring-blue-400/40",
    bg: "bg-blue-400/10",
  },
  {
    id: "telecel",
    label: "Telecel",
    accent: "text-red-400",
    ring: "ring-red-400/40",
    bg: "bg-red-400/10",
  },
];

const PERIOD_TABS = [
  { key: "option1", label: "Daily" },
  { key: "option2", label: "Weekly" },
  { key: "option3", label: "Monthly" },
];

// Fetches active bundle plans for a network, grouped by daily/weekly/monthly,
// from the "echo-bundles" collection.
const loadNetworkBundles = async (network) => {
  if (!["mtn", "tigo", "telecel"].includes(network)) {
    console.error(`Unsupported network requested: ${network}`);
    throw new Error(`Unsupported network: ${network}`);
  }

  const result = { option1: [], option2: [], option3: [] };
  const periods = [
    { subcoll: "daily", key: "option1" },
    { subcoll: "weekly", key: "option2" },
    { subcoll: "monthly", key: "option3" },
  ];

  const networkRef = doc(db, "echo-bundles", network);

  for (const { subcoll, key } of periods) {
    const q = query(
      collection(networkRef, subcoll),
      where("active", "==", true),
      orderBy("price", "asc"),
    );
    const snap = await getDocs(q);

    console.log(
      `[Bundles] ${network}/${subcoll} → found ${snap.size} active plans`,
    );

    result[key] = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  const total =
    result.option1.length + result.option2.length + result.option3.length;
  console.log(`[Bundles] ${network} total active plans: ${total}`);

  return result;
};

// Ghana mobile numbers: 0XXXXXXXXX (10 digits, leading 0)
const isValidGhanaNumber = (value) => /^0\d{9}$/.test(value.trim());

// Visual config for each possible value of the "status" field on an
// echodata-purchases document. Falls back to a neutral style for any
// unrecognized status string.
const ORDER_STATUS_META = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-amber-400 bg-amber-400/10 ring-amber-400/30",
  },
  processing: {
    label: "Processing",
    icon: RefreshCw,
    className: "text-blue-400 bg-blue-400/10 ring-blue-400/30",
  },
  completed: {
    label: "Completed",
    icon: PackageCheck,
    className: "text-emerald-400 bg-emerald-400/10 ring-emerald-400/30",
  },
};

const getStatusMeta = (status) =>
  ORDER_STATUS_META[String(status || "").toLowerCase()] || {
    label: status || "Unknown",
    icon: AlertCircle,
    className: "text-slate-400 bg-slate-400/10 ring-slate-400/30",
  };
const fetchRecentOrderStatuses = async (recipientNumber) => {
  const trimmed = recipientNumber.trim();
  const purchasesRef = collection(db, "echodata_purchases");
  const q = query(
    purchasesRef,
    where("recipientNumber", "==", trimmed),
    orderBy("createdAt", "desc"),
    limit(5),
  );

  const snap = await getDocs(q);
  console.log(`[OrderStatus] ${trimmed} → found ${snap.size} recent order(s)`);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      status: data.status ?? null,
      bundleName: data.bundleName ?? null,
      price: data.price ?? null,
      createdAt: data.createdAt ?? null,
    };
  });
};

function BundlePurchaseModal({ onClose, bundlesCache, preloadStatus }) {
  const [status, setStatus] = useState("form"); // form | processing | success | error

  const [network, setNetwork] = useState(null);
  const [bundleKey, setBundleKey] = useState("");

  const [recipientNumber, setRecipientNumber] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [formError, setFormError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleSelectNetwork = (net) => {
    setNetwork(net);
    setBundleKey("");
  };

  // Flattens the daily/weekly/monthly groups into one list of bundles for
  // the selected network. Each bundle keeps track of which group it came
  // from (needed for the payment payload) via `_periodKey`.
  const mergeAllBundles = (data) => {
    if (!data) return [];
    return PERIOD_TABS.flatMap(({ key }) =>
      (data[key] || []).map((b) => ({ ...b, _periodKey: key })),
    );
  };

  const networkBundles = network ? bundlesCache[network.id] : null;
  const networkStatus = network ? preloadStatus[network.id] : null;
  const bundleOptions = mergeAllBundles(networkBundles);
  const selectedBundle =
    bundleOptions.find((b) => `${b._periodKey}:${b.id}` === bundleKey) || null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!network) {
      setFormError("Select a network.");
      return;
    }
    if (!bundleKey) {
      setFormError("Select a bundle.");
      return;
    }
    if (!isValidGhanaNumber(recipientNumber)) {
      setFormError("Enter a valid recipient number, e.g. 0551234567.");
      return;
    }
    if (!isValidGhanaNumber(momoNumber)) {
      setFormError("Enter a valid Mobile Money number, e.g. 0551234567.");
      return;
    }
    setFormError(null);
    handleInitiatePayment();
  };

  // Calls the backend cloud function that will actually initiate payment.
  // TODO: implement the `initiatePayment` endpoint on the backend. It should
  // charge `momoNumber` via MoMo, then deliver `selectedBundle` to
  // `recipientNumber` once payment is confirmed.
  const handleInitiatePayment = async () => {
    setStatus("processing");
    setSubmitError(null);
    try {
      const payload = {
        network: network.id,
        period: selectedBundle._periodKey,
        bundleId: selectedBundle.id,
        bundleName: selectedBundle.name ?? null,
        price: selectedBundle.price,
        recipientNumber: recipientNumber.trim(),
        momoNumber: momoNumber.trim(),
      };

      console.log("[Payment] Initiating payment request:", payload);
      const res = await fetch(INITIATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          errBody.message || `Payment request failed (${res.status})`,
        );
      }

      const data = await res.json().catch(() => ({}));
      console.log("[Payment] Backend response:", data);

      setStatus("success");
    } catch (err) {
      console.error("[Payment] Failed to initiate payment:", err);
      setSubmitError(
        err?.message ||
          "Something went wrong initiating your payment. Please try again.",
      );
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {status === "form" && "Buy a Data Bundle"}
            {status === "processing" && "Processing"}
            {status === "success" && "Payment initiated"}
            {status === "error" && "Something went wrong"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* FORM */}
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Network */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => handleSelectNetwork(net)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold border transition-all ${
                        network?.id === net.id
                          ? "bg-emerald-500 text-slate-950 border-emerald-500"
                          : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <SmartphoneNfc className="h-3.5 w-3.5" />
                      {net.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bundle */}
              {network && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Bundle
                  </label>

                  {networkStatus === "loading" && !networkBundles && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading bundles…
                    </div>
                  )}

                  {networkStatus === "error" && !networkBundles && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400 py-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Couldn't load bundles for {network.label}. Try again
                      shortly.
                    </p>
                  )}

                  {networkBundles && bundleOptions.length === 0 && (
                    <p className="text-xs text-slate-500 py-2">
                      No active plans for {network.label} right now.
                    </p>
                  )}

                  {networkBundles && bundleOptions.length > 0 && (
                    <select
                      value={bundleKey}
                      onChange={(e) => setBundleKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    >
                      <option value="">Select a bundle</option>
                      {bundleOptions.map((bundle) => (
                        <option
                          key={`${bundle._periodKey}:${bundle.id}`}
                          value={`${bundle._periodKey}:${bundle.id}`}
                        >
                          {bundle.name || bundle.size || bundle.id} — GHS{" "}
                          {Number(bundle.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Recipient number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Recipient number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="0551234567"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-600">
                  The number that will receive the data bundle.
                </p>
              </div>

              {/* MoMo number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Mobile Money number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="0551234567"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-600">
                  The MoMo number payment will be charged to.
                </p>
              </div>

              {formError && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all"
              >
                {selectedBundle
                  ? `Pay GHS ${Number(selectedBundle.price).toFixed(2)}`
                  : "Buy Bundle"}
              </button>
            </form>
          )}

          {/* PROCESSING */}
          {status === "processing" && (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
              <p className="text-sm text-slate-400">
                Sending payment request to {momoNumber || "your MoMo number"}…
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <p className="text-sm text-slate-300 max-w-xs">
                Approve the Mobile Money prompt on{" "}
                <span className="text-white font-semibold">{momoNumber}</span>{" "}
                to complete your purchase. Your bundle will be delivered to{" "}
                <span className="text-white font-semibold">
                  {recipientNumber}
                </span>{" "}
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Done
              </button>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-slate-400 max-w-xs">{submitError}</p>
              <button
                onClick={() => setStatus("form")}
                className="mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStatusModal({ onClose }) {
  const [recipientNumber, setRecipientNumber] = useState("");
  const [status, setStatus] = useState("form"); // form | loading | results | error
  const [orders, setOrders] = useState([]);
  const [formError, setFormError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidGhanaNumber(recipientNumber)) {
      setFormError("Enter a valid recipient number, e.g. 0551234567.");
      return;
    }
    setFormError(null);
    setStatus("loading");
    setSubmitError(null);

    try {
      const results = await fetchRecentOrderStatuses(recipientNumber);
      setOrders(results);
      setStatus("results");
    } catch (err) {
      console.error("[OrderStatus] Failed to fetch order statuses:", err);
      setSubmitError(
        err?.message ||
          "Something went wrong looking up your orders. Please try again.",
      );
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Check Order Status</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* FORM */}
          {(status === "form" || status === "loading") && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Recipient number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="0551234567"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  disabled={status === "loading"}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-600">
                  We'll look up your 5 most recent orders for this number.
                </p>
              </div>

              {formError && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Check Status
                  </>
                )}
              </button>
            </form>
          )}

          {/* RESULTS */}
          {status === "results" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No orders found for{" "}
                  <span className="text-white font-semibold">
                    {recipientNumber}
                  </span>
                  .
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {orders.map((order) => {
                    const meta = getStatusMeta(order.status);
                    const StatusIcon = meta.icon;
                    return (
                      <li
                        key={order.id}
                        className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {order.bundleName || `Order ${order.id}`}
                          </p>
                          {order.price != null && (
                            <p className="text-[11px] text-slate-500">
                              GHS {Number(order.price).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 shrink-0 ${meta.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                onClick={() => {
                  setStatus("form");
                  setOrders([]);
                }}
                className="w-full text-sm font-semibold text-emerald-400 hover:text-emerald-300 py-2"
              >
                Check another number
              </button>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-slate-400 max-w-xs">{submitError}</p>
              <button
                onClick={() => setStatus("form")}
                className="mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const showAgentFeatures = isAgentPortalDomain();

  // Preload bundles for every network in the background as soon as the page
  // loads, so the modal has data ready the instant a user picks a network.
  const [bundlesCache, setBundlesCache] = useState({});
  const [preloadStatus, setPreloadStatus] = useState({});

  useEffect(() => {
    NETWORKS.forEach((network) => {
      setPreloadStatus((prev) => ({ ...prev, [network.id]: "loading" }));
      loadNetworkBundles(network.id)
        .then((data) => {
          setBundlesCache((prev) => ({ ...prev, [network.id]: data }));
          setPreloadStatus((prev) => ({ ...prev, [network.id]: "ready" }));
        })
        .catch((err) => {
          console.error(
            `[Bundles] Background preload failed for ${network.id}:`,
            err,
          );
          setPreloadStatus((prev) => ({ ...prev, [network.id]: "error" }));
        });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
              <Database className="text-emerald-400 h-4 w-4" />
            </div>
            <span>
              Echo<span className="text-emerald-400">data</span>
            </span>
          </div>

          <a
            href={`tel:${CONTACT_PHONE}`}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4" />
            Contact Us
          </a>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Data bundles, delivered instantly.
          </h1>
          <p className="text-base text-slate-400 mt-3 mb-10">
            Buy a bundle for any number, or sign up as an agent to sell data
            with Echodata.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
            >
              Buy a Data Bundle
              <ArrowRight className="h-4 w-4" />
            </button>

            {showAgentFeatures && (
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center justify-center gap-2 bg-transparent hover:bg-slate-800/60 text-white font-semibold text-sm px-6 py-3 rounded-lg border border-slate-700 transition-colors"
              >
                Sign Up as an Agent
              </button>
            )}

            <button
              onClick={() => setShowOrderStatusModal(true)}
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white font-semibold text-sm px-6 py-3 rounded-lg border border-slate-800 transition-colors"
            >
              <Search className="h-4 w-4" />
              Check Order Status
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Echodata Technologies.</p>
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="hover:text-slate-300 transition-colors"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </footer>

      {showPurchaseModal && (
        <BundlePurchaseModal
          onClose={() => setShowPurchaseModal(false)}
          bundlesCache={bundlesCache}
          preloadStatus={preloadStatus}
        />
      )}

      {showOrderStatusModal && (
        <OrderStatusModal onClose={() => setShowOrderStatusModal(false)} />
      )}
    </div>
  );
}
