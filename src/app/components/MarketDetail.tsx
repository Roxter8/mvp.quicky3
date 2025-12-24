import { useState } from 'react';
import { Market } from '../types';
import { X, Clock, TrendingUp, DollarSign, Info } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MarketDetailProps {
  market: Market;
  onClose: () => void;
}

export function MarketDetail({ market, onClose }: MarketDetailProps) {
  const [amount, setAmount] = useState('100');
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol}`;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Ended';
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day';
    return `${diff} days`;
  };

  const calculatePayout = () => {
    const amt = parseFloat(amount) || 0;
    const price = selectedSide === 'YES' ? market.yesPrice : market.noPrice;
    return ((amt / price) * 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="text-white">Market Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Market Image & Title */}
      <div className="px-4 py-6">
        <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 bg-zinc-900">
          <ImageWithFallback
            src={market.image}
            alt={market.title}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-white mb-3">{market.title}</h1>
        {market.description && (
          <p className="text-zinc-400 text-sm mb-4">{market.description}</p>
        )}

        {/* Market Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
              <Clock className="w-3 h-3" />
              <span>Time</span>
            </div>
            <div className="text-white text-sm">{getDaysRemaining(market.endDate)}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Volume</span>
            </div>
            <div className="text-white text-sm">{formatVolume(market.volume)}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
              <DollarSign className="w-3 h-3" />
              <span>Liquidity</span>
            </div>
            <div className="text-white text-sm">{formatVolume(market.volume * 0.3)}</div>
          </div>
        </div>
      </div>

      {/* Current Odds */}
      <div className="px-4 mb-6">
        <h3 className="text-white mb-3">Current Odds</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedSide('YES')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              selectedSide === 'YES'
                ? 'bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border-emerald-500'
                : 'bg-gradient-to-br from-emerald-950/30 to-emerald-900/20 border-emerald-800/50'
            }`}
          >
            <div className="text-sm text-emerald-400 mb-2">YES</div>
            <div className="text-2xl text-emerald-300">{market.yesPrice}¢</div>
            <div className="text-xs text-emerald-400/70 mt-1">{market.yesPrice}% chance</div>
          </button>
          <button
            onClick={() => setSelectedSide('NO')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              selectedSide === 'NO'
                ? 'bg-gradient-to-br from-rose-950/50 to-rose-900/30 border-rose-500'
                : 'bg-gradient-to-br from-rose-950/30 to-rose-900/20 border-rose-800/50'
            }`}
          >
            <div className="text-sm text-rose-400 mb-2">NO</div>
            <div className="text-2xl text-rose-300">{market.noPrice}¢</div>
            <div className="text-xs text-rose-400/70 mt-1">{market.noPrice}% chance</div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="px-4 mb-6">
        <h3 className="text-white mb-3">Prediction Amount</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
          <div className="text-xs text-zinc-400 mb-2">Amount (USDC)</div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent border-none text-2xl text-white p-0 focus-visible:ring-0"
            placeholder="0.00"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['10', '50', '100', '500'].map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className="py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm hover:border-zinc-700 transition-colors"
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Payout Estimate */}
        <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border border-blue-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
            <Info className="w-4 h-4" />
            <span>Potential Payout</span>
          </div>
          <div className="text-2xl text-white">${calculatePayout()}</div>
          <div className="text-xs text-zinc-400 mt-1">
            If {selectedSide} wins • {((parseFloat(calculatePayout()) / parseFloat(amount || '0') - 1) * 100).toFixed(1)}% profit
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 pb-6">
        <Button
          className={`w-full h-14 rounded-2xl text-white ${
            selectedSide === 'YES'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
              : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400'
          }`}
        >
          Predict {selectedSide} • ${amount || '0'}
        </Button>
        <p className="text-center text-xs text-zinc-500 mt-3">
          Non-custodial • On-chain settlement
        </p>
      </div>
    </div>
  );
}
