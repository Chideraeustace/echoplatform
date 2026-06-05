import React, { useState, useEffect } from "react";
import { auth } from "../../firebase"; // Adjust path based on your folders
import { ShoppingCart, Loader2, Send, CheckCircle2 } from "lucide-react";

export default function OrderSection({ agentData }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Change the plans list whenever the agent selects a different network
  useEffect(() => {
    if (!network || !agentData) {
      setPlansList([]);
      return;
    }

    let networkData = {};

    // Get the correct list of packages from the agent's account data
    if (network === "MTN") {
      networkData = agentData.mtnPackages || {};
    } else if (network === "Telecel") {
      networkData = agentData.telecelPackages || {};
    } else if (network === "AT") {
      networkData = agentData.airteltigoPackages || {};
    }

    // Convert the database object into a clean list for the screen selection
    const formattedPlans = Object.keys(networkData)
      .map((key) => ({
        id: key, // e.g. "1gb"
        ...networkData[key], // sets size, costPrice, isActive
      }))
      // Only keep packages that are turned on (true)
      .filter((item) => item.isActive === true);

    setPlansList(formattedPlans);
  }, [network, agentData]);

  const handleBuyData = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phoneNumber || !network || !selectedPlan) {
      setError("Please fill in all the details.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You are logged out. Please log in again.");
      }

      // Find the specific plan the user clicked on
      const currentPlan = plansList.find((p) => p.id === selectedPlan);

      // Send the data request to your backend function code
      const response = await fetch(
        "https://us-central1-eustech-c4332.cloudfunctions.net/echoplaceorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            phoneNumber: phoneNumber,
            network: network,
            plan: selectedPlan,
            costPrice: currentPlan?.costPrice,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to buy the data package.");
      }

      setSuccess(`Success! Sent ${currentPlan?.size} data to ${phoneNumber}.`);
      setPhoneNumber("");
      setNetwork("");
      setSelectedPlan("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Buy Data Bundle</h2>
          <p className="text-sm text-slate-400 mt-1">
            Send data bundles directly to any phone number.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-sm font-mono rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-mono rounded-xl">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleBuyData} className="space-y-4">
        {/* Phone Number input */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="Example: 0244123456"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Network Option Select box */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Select Network
          </label>
          <select
            value={network}
            onChange={(e) => {
              setNetwork(e.target.value);
              setSelectedPlan("");
            }}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          >
            <option value="" disabled>
              -- Select Network --
            </option>
            <option value="MTN">MTN Ghana</option>
            <option value="Telecel">Telecel</option>
            <option value="AT">AT (AirtelTigo)</option>
          </select>
        </div>

        {/* Dynamic Package selection list loaded from database maps */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Select Package
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            disabled={loading || !network || plansList.length === 0}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          >
            <option value="" disabled>
              {network
                ? "-- Choose Package --"
                : "-- Choose a network first --"}
            </option>
            {plansList.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.size} — GHS {parseFloat(plan.costPrice).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Data...
            </>
          ) : (
            <>
              Send Data Package
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
