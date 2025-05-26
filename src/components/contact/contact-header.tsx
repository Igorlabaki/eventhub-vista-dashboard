import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

interface ContactHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
}

export function ContactHeader({
  activeTab,
  onTabChange,
  onActionClick,
  isFormOpen = false,
}: ContactHeaderProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1">
          <TabsTrigger
            value="all"
            className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === "all" ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500" : "border-b-4 border-transparent"}`}
            onClick={() => onTabChange("all")}
          >
            TODOS
          </TabsTrigger>
          <TabsTrigger
            value="internal"
            className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === "internal" ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500" : "border-b-4 border-transparent"}`}
            onClick={() => onTabChange("internal")}
          >
            EQUIPE
          </TabsTrigger>
          <TabsTrigger
            value="supplier"
            className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === "supplier" ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500" : "border-b-4 border-transparent"}`}
            onClick={() => onTabChange("supplier")}
          >
            FORNECEDORES
          </TabsTrigger>
        </TabsList>
        {!isFormOpen && (
          <Button
            className="bg-violet-500 hover:bg-violet-600 text-white md:my-0 font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:block md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={onActionClick}
          >
            + Novo Contato
          </Button>
        )}
      </div>
      {/* Botão flutuante mobile */}
      {!isFormOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={onActionClick}
          aria-label="Novo Contato"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
} 