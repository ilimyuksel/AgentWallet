"use client";

import { Agent, AgentWallet } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryLabels: Record<string, string> = {
  finance:       "Finans",
  food:          "Yemek",
  communication: "İletişim",
  transport:     "Ulaşım",
  weather:       "Hava Durumu",
  productivity:  "Verimlilik",
};

interface Props {
  agent: Agent;
  wallet?: AgentWallet;
  onConnect?: (id: string) => void;
}

export function AgentCard({ agent, wallet, onConnect }: Props) {
  return (
    <Card className="bg-white border border-[#d0d7de] shadow-sm hover:shadow-md hover:border-[#b7bfc8] transition-all group rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center text-xl">
              {agent.icon}
            </div>
            <div>
              <p className="font-semibold text-[#1f2328] text-sm leading-tight">{agent.name}</p>
              <Badge variant="outline" className="mt-1 text-[10px] text-[#656d76] border-[#d0d7de] bg-[#f6f8fa]">
                {categoryLabels[agent.category]}
              </Badge>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-[#656d76] leading-relaxed">{agent.description}</p>

        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f8fa] text-[#656d76] border border-[#d0d7de]"
            >
              {cap}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#d0d7de]">
          <div>
            {agent.pricePerCall > 0 ? (
              <p className="text-xs text-[#656d76]">
                <span className="text-[#1f2328] font-semibold">${agent.pricePerCall.toFixed(3)}</span> / çağrı
              </p>
            ) : (
              <p className="text-xs text-[#1a7f37] font-medium">Ücretsiz</p>
            )}
            {wallet && (
              <p className="text-[10px] text-[#9198a1] mt-0.5">
                Bakiye: <span className="text-[#1f2328] font-medium">${wallet.balance.toFixed(2)}</span>
              </p>
            )}
          </div>

          <button
            onClick={() => onConnect?.(agent.id)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors border ${
              agent.isConnected
                ? "bg-[#dafbe1] text-[#1a7f37] border-[#aceebb] hover:bg-[#c6efce]"
                : "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
            }`}
          >
            {agent.isConnected ? "Bağlı ✓" : "Bağla"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
