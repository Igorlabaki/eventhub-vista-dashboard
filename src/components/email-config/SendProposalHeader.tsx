import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

interface SendProposalHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SendProposalHeader({ activeTab, onTabChange }: SendProposalHeaderProps) {
  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1 w-full md:w-[200px]">
          <TabsTrigger
            value="whatsapp"
            className={`px-4 py-2 text-sm font-semibold transition-all duration-200 w-full md:w-auto ${
              activeTab === "whatsapp"
                ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                : "border-b-4 border-transparent"
            }`}
          >
            WHATSAPP
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className={`px-4 py-2 text-sm font-semibold transition-all duration-200 w-full md:w-auto ${
              activeTab === "email"
                ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                : "border-b-4 border-transparent"
            }`}
          >
            EMAIL
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
} 