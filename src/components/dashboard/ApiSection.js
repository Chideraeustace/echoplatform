import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import {
  Code2,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Terminal,
  Lock,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Wallet,
  Activity,
} from "lucide-react";

export default function ApiSection({ agentData }) {
  const [showKey, setShowKey] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [activeTab, setActiveTab] = useState("buy");

  // Key Generation States
  const [password, setPassword] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiKeyExists = !!agentData?.apiKey;
  const currentApiKey = agentData?.apiKey || "YOUR_SECRET_KEY_HERE";
  const myUserId = auth.currentUser?.uid || "YOUR_ACCOUNT_ID";
  const baseUrl = "https://us-central1-eustech-c4332.cloudfunctions.net";

  const copyToClipboard = (text, keyLabel) => {
    navigator.clipboard.writeText(text);
    setCopiedText(keyLabel);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGenerating(true);

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("Session timed out. Please refresh your page.");
      setGenerating(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      const randomBytes = new Uint8Array(24);
      window.crypto.getRandomValues(randomBytes);
      const generatedToken =
        "sk_live_" +
        Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join(
          "",
        );

      const docRef = doc(db, "echoagents", user.uid);
      await updateDoc(docRef, { apiKey: generatedToken });

      setSuccess("Your secret connection key has been created!");
      setPassword("");
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect account password. Try again.");
      } else {
        setError(
          "Failed to create the key. Please check your network connection.",
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  // LAYMAN DOCUMENTATION CONFIGURATION DATA
  const tabData = {
    buy: {
      title: "1. Buy Data Bundles",
      method: "POST",
      desc: "Use this connection setup to automatically send and process new data orders directly from your web system.",
      url: `${baseUrl}/placeorder`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentApiKey}`,
      },
      requestPayload: JSON.stringify(
        {
          userId: myUserId,
          phoneNumber: "0244123456",
          network: "MTN",
          plan: "10gb",
        },
        null,
        2,
      ),
      responsePayload: JSON.stringify(
        {
          success: true,
          message: "Data purchase order placed and queued successfully.",
          orderId: "AbCdEfGh123456789",
          details: {
            network: "MTN",
            plan: "10GB Bundle",
            price: 12.5,
            recipient: "0244123456",
          },
        },
        null,
        2,
      ),
    },
    balance: {
      title: "2. Check Wallet Balance",
      method: "GET",
      desc: "Use this clean text setup to quickly check how much cash balance is remaining inside your profile workspace wallet.",
      url: `${baseUrl}/checkbalance?userId=${myUserId}`,
      headers: {
        Authorization: `Bearer ${currentApiKey}`,
      },
      requestPayload:
        "No JSON payload needed for GET links. The Account ID is attached directly on the web address link above.",
      responsePayload: JSON.stringify(
        {
          success: true,
          userId: myUserId,
          storeName: agentData?.dataSellingName || "your-store",
          balance: 450.25,
          earnings: 89.1,
        },
        null,
        2,
      ),
    },
    status: {
      title: "3. Check Order Status",
      method: "POST",
      desc: "Use this background task sequence loop to monitor if a queued phone transaction bundle delivery is completely finished.",
      url: `${baseUrl}/checkstatus`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentApiKey}`,
      },
      requestPayload: JSON.stringify(
        {
          userId: myUserId,
          orderId: "AbCdEfGh123456789",
        },
        null,
        2,
      ),
      responsePayload: JSON.stringify(
        {
          success: true,
          orderId: "AbCdEfGh123456789",
          status: "completed",
        },
        null,
        2,
      ),
    },
  };

  return (
    <div className="space-y-6">
      {/* SECTION TOP HEADER */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Code2 className="h-5 w-5 text-emerald-400" /> API Integrations
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Link Our API to external scripts, developer
          websites, or third-party automated programs using our three simple
          links below.
        </p>
      </div>

      {/* FEEDBACK STATUS ALERTS */}
      {success && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs font-mono rounded-xl flex items-center gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RENDER CONNECTION KEY BOX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-400" /> Your Secret Connection
            Key
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs overflow-hidden">
            <span
              className={`truncate pr-4 font-mono ${apiKeyExists ? "text-slate-300" : "text-slate-600"}`}
            >
              {showKey || !apiKeyExists
                ? currentApiKey
                : "••••••••••••••••••••••••••••••••••••••••••••••••"}
            </span>
            {apiKeyExists && (
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          <button
            onClick={() => copyToClipboard(agentData?.apiKey || "", "key")}
            disabled={!apiKeyExists}
            className="px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-30"
          >
            {copiedText === "key" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-amber-400/80">
          Important Notice: Keep this secret key completely private. Anyone who
          has a copy of this key can purchase data packages using your balance
          money.
        </p>
      </div>

      {/* GENERATE ACCOUNT KEY (REQUIRES PASSWORD PRE-CHECK) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-emerald-400" /> Security Check:
          Generate Connection Key
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          For your protection, you must type your account password below to
          confirm it is really you. Generating a new key will immediately break
          any old ones you used previously.
        </p>

        <form onSubmit={handleGenerateKey} className="space-y-3 pt-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <input
              type="password"
              placeholder="Enter your login account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={generating}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white transition-all focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={generating || !password}
            className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                Verifying Password & Generating Key...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                {apiKeyExists
                  ? "Create A New Connection Key"
                  : "Generate My Secret Connection Key"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* THREE-ENDPOINTS TABULATED DOCUMENTATION SYSTEM CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono text-slate-400 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" /> Setup Instructions
            & Connection Examples
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on the tabs below to copy links and sample instructions
            directly for your website builder.
          </p>
        </div>

        {/* INTERACTIVE NAVIGATION CONTROL TABS BAR */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-800/80 pb-3">
          {[
            { id: "buy", label: "1. Buy Data", icon: ShoppingCart },
            { id: "balance", label: "2. Check Balance", icon: Wallet },
            { id: "status", label: "3. Check Status", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 rounded-xl border font-bold text-xs transition-all flex flex-col sm:flex-row items-center gap-2 justify-center text-center ${
                  isTabActive
                    ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE CONTENT GRID AREA PANELS */}
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">
                {tabData[activeTab].title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {tabData[activeTab].desc}
              </p>
            </div>
            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded font-extrabold ${
                tabData[activeTab].method === "GET"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {tabData[activeTab].method}
            </span>
          </div>

          {/* LINK COPY AREA FIELD ELEMENT */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
              Web Connection Link (URL)
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300 flex items-center justify-between gap-4">
              <span className="truncate text-emerald-400">
                {tabData[activeTab].url}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(tabData[activeTab].url, `${activeTab}-url`)
                }
                className="text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0"
              >
                {copiedText === `${activeTab}-url` ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* HEADERS CONFIG BOX CONTAINER */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
                Connection Passports (Required Headers)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(tabData[activeTab].headers, null, 2),
                    `${activeTab}-head`,
                  )
                }
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 font-mono"
              >
                {copiedText === `${activeTab}-head` ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}{" "}
                Copy
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 border border-slate-850/60 font-mono text-[11px] text-sky-400 rounded-xl overflow-x-auto leading-relaxed">
              <code>{JSON.stringify(tabData[activeTab].headers, null, 2)}</code>
            </pre>
          </div>

          {/* DATA CODE INFO SPLIT HOVER BLOCK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* INPUT JSON DATA ELEMENT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
                  What your website sends (Request Body)
                </span>
                {tabData[activeTab].method === "POST" && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        tabData[activeTab].requestPayload,
                        `${activeTab}-req`,
                      )
                    }
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 font-mono"
                  >
                    {copiedText === `${activeTab}-req` ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}{" "}
                    Copy
                  </button>
                )}
              </div>
              <div className="bg-slate-950 p-3.5 border border-slate-850/60 font-mono text-[11px] text-amber-400/90 rounded-xl overflow-x-auto h-40 select-all leading-relaxed">
                {tabData[activeTab].requestPayload}
              </div>
            </div>

            {/* OUTPUT RESPONSE JSON DATA ELEMENT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
                  What Echodata answers back (Response JSON)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      tabData[activeTab].responsePayload,
                      `${activeTab}-res`,
                    )
                  }
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 font-mono"
                >
                  {copiedText === `${activeTab}-res` ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}{" "}
                  Copy
                </button>
              </div>
              <pre className="bg-slate-950 p-3.5 border border-slate-850/60 font-mono text-[11px] text-emerald-400/90 rounded-xl overflow-x-auto h-40 leading-relaxed">
                <code>{tabData[activeTab].responsePayload}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
