import { useEffect, useMemo, useState } from "react";
import { Settings, ArrowUp, ArrowDown, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

type UsernameState = {
  value: string;
  isChecking: boolean;
  error?: string;
};

function maskAddress(addr: string) {
  if (!addr) return "";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function loadUsernames(): string[] {
  try {
    const raw = localStorage.getItem("qmvp_usernames");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsernames(usernames: string[]) {
  localStorage.setItem("qmvp_usernames", JSON.stringify(Array.from(new Set(usernames))));
}

async function fetchTonBalanceTON(userFriendlyAddress: string): Promise<number | null> {
  try {
    // Public endpoint (no key). Good for MVP/demo.
    const resp = await fetch(`https://tonapi.io/v2/accounts/${encodeURIComponent(userFriendlyAddress)}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const nano = typeof data?.balance === "string" ? Number(data.balance) : Number(data?.balance);
    if (!Number.isFinite(nano)) return null;
    return nano / 1e9;
  } catch {
    return null;
  }
}

export function PortfolioScreen() {
  const wallet = useTonWallet();
  const address = useTonAddress(); // user-friendly
  const [tonConnectUI] = useTonConnectUI();

  const isConnected = !!wallet && !!address;

  const [username, setUsername] = useState<string>(() => {
    if (!address) return "";
    return localStorage.getItem(`qmvp_username_${address}`) || "";
  });

  const [usernameState, setUsernameState] = useState<UsernameState>({
    value: "",
    isChecking: false,
  });

  const [balanceTON, setBalanceTON] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Keep username in sync after connect
  useEffect(() => {
    if (!address) return;
    const stored = localStorage.getItem(`qmvp_username_${address}`) || "";
    setUsername(stored);
    setUsernameState((s) => ({ ...s, value: stored || "" }));
  }, [address]);

  // Fetch balance after connect
  useEffect(() => {
    let cancelled = false;
    if (!isConnected) {
      setBalanceTON(null);
      return;
    }
    setBalanceLoading(true);
    fetchTonBalanceTON(address).then((val) => {
      if (cancelled) return;
      setBalanceTON(val);
      setBalanceLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isConnected, address]);

  const pnlChartData = useMemo(() => {
    // MVP: no history yet -> flat line
    return Array.from({ length: 12 }, () => ({ value: 0 }));
  }, []);

  const totalPnL = 0;

  // --------------- UI blocks ---------------

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#050B1A] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-white text-lg font-semibold">Portfolio</h1>
          <p className="text-[#93A4C7] text-sm">Your profile & stats live here</p>
        </div>

        <div className="px-4 mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-white/80" />
            </div>

            <h2 className="text-white text-xl font-semibold mb-2">To see your profile</h2>
            <p className="text-[#93A4C7] text-sm mb-6">
              Connect your wallet to view balance, bets, and rewards.
            </p>

            <Button
              className="w-full h-12 rounded-xl text-base font-medium bg-blue-500 hover:bg-blue-400 active:scale-[0.99] transition"
              onClick={() => tonConnectUI.openModal()}
            >
              Connect your wallet
            </Button>

            <p className="text-[#93A4C7] text-xs mt-3">
              Non-custodial. You keep full control.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Username gate (first-time connected)
  if (!username) {
    const onSave = async () => {
      const value = usernameState.value.trim().replace(/^@/, "");
      if (value.length < 3) {
        setUsernameState((s) => ({ ...s, error: "Username must be at least 3 characters." }));
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        setUsernameState((s) => ({ ...s, error: "Use only letters, numbers, and underscores." }));
        return;
      }

      setUsernameState((s) => ({ ...s, isChecking: true, error: undefined }));

      // MVP availability check: local-only
      const existing = loadUsernames().map((u) => u.toLowerCase());
      const isTaken = existing.includes(value.toLowerCase());

      await new Promise((r) => setTimeout(r, 300)); // tiny delay for nicer UX

      if (isTaken) {
        setUsernameState((s) => ({ ...s, isChecking: false, error: "Username is taken. Try another." }));
        return;
      }

      const next = loadUsernames();
      next.push(value);
      saveUsernames(next);

      localStorage.setItem(`qmvp_username_${address}`, value);
      setUsername(value);
      setUsernameState((s) => ({ ...s, isChecking: false, error: undefined }));
    };

    return (
      <div className="min-h-screen bg-[#050B1A] pb-20">
        <div className="px-4 pt-6 flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-semibold">Create your profile</h1>
            <p className="text-[#93A4C7] text-sm">Pick a username to continue</p>
          </div>
          <div className="text-xs text-white/60">{maskAddress(address)}</div>
        </div>

        <div className="px-4 mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <label className="text-white/80 text-sm block mb-2">Username</label>

            <div className="flex items-center gap-2">
              <div className="text-white/60">@</div>
              <input
                value={usernameState.value}
                onChange={(e) => setUsernameState((s) => ({ ...s, value: e.target.value, error: undefined }))}
                placeholder="yourname"
                className="flex-1 h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            {usernameState.error ? (
              <p className="text-red-300 text-xs mt-2">{usernameState.error}</p>
            ) : (
              <p className="text-[#93A4C7] text-xs mt-2">No password needed. You can change later.</p>
            )}

            <Button
              className="w-full h-12 mt-5 rounded-xl text-base font-medium bg-blue-500 hover:bg-blue-400 active:scale-[0.99] transition"
              onClick={onSave}
              disabled={usernameState.isChecking}
            >
              {usernameState.isChecking ? "Checking..." : "Save username"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Connected + username set
  return (
    <div className="min-h-screen bg-[#050B1A] pb-20">
      {/* Header */}
      <div className="px-4 pt-6 flex items-start justify-between">
        <div>
          <h1 className="text-white text-lg font-semibold">Welcome, @{username}</h1>
          <p className="text-[#93A4C7] text-sm">{maskAddress(address)}</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-[0.98] transition">
          <Settings className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Balance */}
      <div className="px-4 mt-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/7 to-white/3 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#93A4C7] text-sm">Wallet balance</p>
            <div className="text-xs text-white/60">TON</div>
          </div>

          <div className="text-white text-3xl font-semibold tracking-tight">
            {balanceLoading ? "Loading..." : balanceTON === null ? "—" : `${balanceTON.toFixed(3)}`}
          </div>

          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlChartData}>
                <YAxis hide domain={[-1, 1]} />
                <Area type="monotone" dataKey="value" strokeWidth={2} stroke="rgba(59,130,246,0.9)" fill="rgba(59,130,246,0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[#93A4C7] text-sm">P&L</p>
            <p className="text-white font-medium">{totalPnL >= 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}</p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition">
              <ArrowDown className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition">
              <ArrowUp className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Active Bets */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Active Bets</h2>
          <p className="text-xs text-white/60">0</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/80 text-sm mb-1">No active bets yet</p>
          <p className="text-[#93A4C7] text-xs">Place your first prediction on the Home tab.</p>
        </div>
      </div>

      {/* History */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">History</h2>
          <p className="text-xs text-white/60">0</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/80 text-sm mb-1">Nothing here yet</p>
          <p className="text-[#93A4C7] text-xs">Your settled bets will show up here.</p>
        </div>
      </div>
    </div>
  );
}
