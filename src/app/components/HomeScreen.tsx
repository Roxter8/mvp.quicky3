import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Flame, Sparkles } from "lucide-react";
import { MarketCard } from "./MarketCard";
import { MarketDetail } from "./MarketDetail";
import { markets } from "../data/markets";
import { Market } from "../types";
import { Button } from "./ui/button";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

function getUsername(address: string) {
  if (!address) return "";
  return localStorage.getItem(`qmvp_username_${address}`) || "";
}

const TOP5 = ["bitcoin", "ethereum", "solana", "bnb", "ton"];

export function HomeScreen() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const username = address ? getUsername(address) : "";
  const isConnected = !!wallet && !!address;

  const quickMarkets = useMemo(() => {
    // Best-effort: pick 5 crypto markets (or fallback)
    const crypto = markets.filter((m) => m.category === "crypto");
    const prioritized = crypto.sort((a, b) => {
      const aScore = TOP5.some((k) => a.title.toLowerCase().includes(k)) ? 1 : 0;
      const bScore = TOP5.some((k) => b.title.toLowerCase().includes(k)) ? 1 : 0;
      return bScore - aScore;
    });
    return prioritized.slice(0, 5);
  }, []);

  const otherMarkets = useMemo(() => {
    // Keep the rest for browsing
    const pickedIds = new Set(quickMarkets.map((m) => m.id));
    return markets.filter((m) => !pickedIds.has(m.id));
  }, [quickMarkets]);

  if (selectedMarket) {
    return <MarketDetail market={selectedMarket} onClose={() => setSelectedMarket(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#050B1A] pb-20">
      {/* Header (not sticky) */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-semibold">
              {username ? `Welcome, @${username}` : "Welcome"}
            </h1>
            <p className="text-[#93A4C7] text-sm">
              Crypto predictions in minutes. Quick, simple, non-custodial.
            </p>
          </div>

          {!isConnected ? (
            <Button
              className="h-10 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 active:scale-[0.99] transition"
              onClick={() => tonConnectUI.openModal()}
            >
              Connect
            </Button>
          ) : (
            <div className="text-xs text-white/60">Connected</div>
          )}
        </div>
      </div>

      {/* Quick 15m markets */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <h2 className="text-white font-semibold">Quick 15m</h2>
          <span className="text-xs text-white/50">Top markets</span>
        </div>

        <div className="space-y-3">
          {quickMarkets.map((market) => (
            <div key={market.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{market.title}</p>
                  <p className="text-[#93A4C7] text-xs mt-1">
                    Next 15 minutes · Pick a side (MVP demo)
                  </p>
                </div>
                <button
                  className="ml-3 text-xs text-white/60 hover:text-white transition"
                  onClick={() => setSelectedMarket(market)}
                >
                  Details
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 h-11 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-100 border border-emerald-400/20 active:scale-[0.99] transition"
                  onClick={() => setSelectedMarket(market)}
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Up
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-100 border border-rose-400/20 active:scale-[0.99] transition"
                  onClick={() => setSelectedMarket(market)}
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Down
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browse */}
      <div className="px-4 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-300" />
          <h2 className="text-white font-semibold">Browse markets</h2>
        </div>
        <div className="space-y-3">
          {otherMarkets.slice(0, 8).map((market) => (
            <MarketCard key={market.id} market={market} onClick={() => setSelectedMarket(market)} />
          ))}
        </div>
      </div>
    </div>
  );
}
