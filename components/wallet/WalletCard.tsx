"use client";

import { Agent, AgentWallet } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/agents/StatusBadge";

interface Props {
  agent: Agent;
  wallet: AgentWallet;
  maxBalance?: number;
}

export function WalletCard({ agent, wallet, maxBalance = 20 }: Props) {
  const pct = Math.min((wallet.balance / maxBalance) * 100, 100);
  const isLow = wallet.balance > 0 && wallet.balance < 2;

  return (
    <Card className="bg-white border border-[#d0d7de] shadow-sm rounded-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center text-lg">
              {agent.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f2328] leading-tight">{agent.name}</p>
              <p className="text-[10px] text-[#9198a1] font-mono mt-0.5">{agent.walletAddress}</p>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-[#1f2328]">${wallet.balance.toFixed(2)}</span>
            <span className="text-xs text-[#9198a1]">{wallet.agtBalance.toLocaleString()} AGT</span>
          </div>
          <Progress
            value={pct}
            className={`h-1.5 bg-[#f6f8fa] ${isLow ? "[&>div]:bg-[#d1242f]" : "[&>div]:bg-violet-500"}`}
          />
          {isLow && (
            <p className="text-[10px] text-[#bc4c00]">⚠ Düşük bakiye — lütfen fon ekleyin</p>
          )}
          {wallet.balance === 0 && (
            <p className="text-[10px] text-[#9198a1]">Henüz fonlanmamış</p>
          )}
        </div>

        {agent.pricePerCall > 0 && (
          <p className="text-[10px] text-[#9198a1] border-t border-[#d0d7de] pt-2">
            Çağrı başına:{" "}
            <span className="text-[#1f2328] font-medium">${agent.pricePerCall.toFixed(3)}</span>
            {wallet.balance > 0 && (
              <>
                {" "}· Kalan:{" "}
                <span className="text-[#1f2328] font-medium">
                  {Math.floor(wallet.balance / agent.pricePerCall).toLocaleString()}
                </span>{" "}
                çağrı
              </>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
