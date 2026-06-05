import React, { useState } from "react";
import { Store, Copy, Check } from "lucide-react";

export default function StorefrontSection({ agentData }) {
  const [copied, setCopied] = useState(false);

  // Create the beautiful public URL for customers using the agent's unique store name
  const storeSlug = agentData?.dataSellingName || "my-store";
  const publicStoreUrl = `${window.location.protocol}//${window.location.host}/store/${storeSlug}`;

  // Copy the public link to the computer clipboard memory
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 className=animate-fadeIn">
      {/* STOREFRONT LINK CARD SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Your Public Storefront
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Share this unique link with your customers. They can browse your
              packages and buy data directly at the prices you configured.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs text-slate-300 flex items-center overflow-x-auto whitespace-nowrap select-all">
            {publicStoreUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 min-w-[120px]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
