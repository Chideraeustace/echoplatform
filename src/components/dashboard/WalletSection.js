import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase"; // Adjust path based on your file structure
import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  CreditCard,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  History,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function WalletSection({ agentData }) {
  const [amount, setAmount] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isReconciling, setIsReconciling] = useState(false);

  // New State for Live Transactions List
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const activeUserId = auth.currentUser?.uid || agentData?.id;

  // --- EFFECT 1: Live Stream User Transaction History ---
  useEffect(() => {
    if (!activeUserId) return;

    const txCollectionRef = collection(db, "echowallet-transactions");
    const q = query(
      txCollectionRef,
      where("userId", "==", activeUserId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const historicalList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(historicalList);
        setLoadingHistory(false);
      },
      (err) => {
        console.error("Error streaming transactions:", err);
        setLoadingHistory(false);
      },
    );

    return () => unsubscribe();
  }, [activeUserId]);

  // --- EFFECT 2: URL Parameter Handler for Redirect Reconciliation ---
  useEffect(() => {
    const handleUrlReconciliation = async () => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      const reference = params.get("reference");

      if (status === "success" && reference) {
        setIsReconciling(true);
        setSuccessMessage("Verifying your payment reference...");

        try {
          const transactionDocRef = doc(
            db,
            "echowallet-transactions",
            reference,
          );
          const agentId = auth.currentUser?.uid || agentData?.id;

          if (!agentId) {
            throw new Error(
              "User session not found. Balance couldn't be updated.",
            );
          }

          const agentDocRef = doc(db, "echoagents", agentId);

          await runTransaction(db, async (transaction) => {
            const txDoc = await transaction.get(transactionDocRef);

            if (!txDoc.exists()) {
              throw new Error("Transaction record not found.");
            }

            const txData = txDoc.data();

            if (txData.status !== "pending") {
              console.log(
                `Transaction ${reference} has already been marked as ${txData.status}.`,
              );
              setSuccessMessage("Payment already processed and credited.");
              return;
            }

            const agentDoc = await transaction.get(agentDocRef);
            if (!agentDoc.exists()) {
              throw new Error("Agent account profile not found.");
            }

            // 1. Update the transaction status in the collection
            transaction.update(transactionDocRef, {
              status: "completed",
              updatedAt: new Date(),
            });

            // 2. Safely credit the agent's wallet balance
            const currentBalance = agentDoc.data().walletBalance || 0;
            const topUpAmount = txData.amount || 0;

            transaction.update(agentDocRef, {
              walletBalance: currentBalance + topUpAmount,
            });

            setSuccessMessage(
              `Success! GHS ${topUpAmount.toFixed(2)} has been added to your balance.`,
            );
          });
        } catch (err) {
          console.error("Reconciliation failed:", err);
          setErrorMessage(
            err.message || "Failed to process your deposit reference safely.",
          );
          setSuccessMessage("");
        } finally {
          setIsReconciling(false);

          // Clean up URL bar parameters so refreshing doesn't re-trigger the script block
          const cleanUrl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
        }
      }
    };

    handleUrlReconciliation();
  }, [agentData]);

  // --- Existing Submission Handler ---
  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      setErrorMessage("The minimum top-up amount is GHS 10.00");
      return;
    }

    setIsRedirecting(true);

    try {
      const user = auth.currentUser;
      const userEmail = agentData?.email || user?.email;

      if (!user || !userEmail) {
        throw new Error("User session not found. Please log in again.");
      }

      const response = await fetch(
        "https://us-central1-eustech-c4332.cloudfunctions.net/echotopup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parsedAmount,
            email: userEmail,
            userId: user.uid,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(
          data.message || "Failed to get checkout URL from backend.",
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* WALLET TOP-UP CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Wallet Top Up</h2>
            <p className="text-sm text-slate-400 mt-1">
              Add money to your account balance using Moolre for seamless data
              purchases and automated transactions.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-sm font-mono rounded-xl flex items-center gap-3">
            {isReconciling ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-sm font-mono rounded-xl">
            Error: {errorMessage}
          </div>
        )}

        <form onSubmit={handleTopUpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Amount to Deposit (GHS)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500 font-bold">
                GHS
              </span>
              <input
                type="number"
                step="0.01"
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isRedirecting || isReconciling}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-14 pr-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRedirecting || isReconciling}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting to Moolre...
              </>
            ) : (
              <>
                Pay Now
                <ArrowUpRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-slate-500 text-[11px] font-mono">
          <ShieldCheck className="h-4 w-4 text-emerald-500/40" />
          <span>Secured by Moolre encryption.</span>
        </div>
      </div>

      {/* DYNAMIC TRANSACTION HISTORY BOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-white font-bold mb-4">
          <History className="h-4 w-4 text-slate-400" />
          <h3>Transaction History</h3>
        </div>

        {loadingHistory ? (
          <div className="h-40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-xs font-mono text-slate-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            Retrieving account transactions ledger...
          </div>
        ) : transactions.length === 0 ? (
          <div className="h-40 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs font-mono text-slate-500">
            No deposits or balance ledger records found for this user node.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-500 text-[10px] tracking-wider uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Reference ID / Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {transactions.map((tx) => {
                  const txDate = tx.createdAt?.seconds
                    ? new Date(tx.createdAt.seconds * 1000).toLocaleString()
                    : "Processing...";

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 space-y-0.5">
                        <div className="text-slate-200 font-bold truncate max-w-[160px] flex items-center gap-1">
                          {tx.id}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {txDate}
                        </div>
                      </td>
                      <td className="p-4 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            tx.type === "purchase"
                              ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                              : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                          }`}
                        >
                          {tx.type || "deposit"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">
                        GHS {parseFloat(tx.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          {tx.status === "completed" && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Success
                            </span>
                          )}
                          {tx.status === "pending" && (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 animate-pulse" />{" "}
                              Pending
                            </span>
                          )}
                          {tx.status === "failed" && (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Failed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
