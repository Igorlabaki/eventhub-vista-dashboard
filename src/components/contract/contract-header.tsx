import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

interface ContractHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onActionClick: () => void;
  isFormOpen: boolean;
}

export function ContractHeader({
  activeTab,
  onTabChange,
  onActionClick,
  isFormOpen = false,
}: ContractHeaderProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1">
          <TabsTrigger
            value="clausulas"
            className={
              `px-4 py-2 text-sm font-semibold transition-all duration-200
              ${activeTab === "clausulas"
                ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                : "border-b-4 border-transparent"}`
            }
            onClick={() => onTabChange("clausulas")}
          >
            CLÁUSULAS
          </TabsTrigger>
          <TabsTrigger
            value="anexos"
            className={
              `px-4 py-2 text-sm font-semibold transition-all duration-200
              ${activeTab === "anexos"
                ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                : "border-b-4 border-transparent"}`
            }
            onClick={() => onTabChange("anexos")}
          >
            ANEXOS
          </TabsTrigger>
          <TabsTrigger
            value="contratos"
            className={
              `px-4 py-2 text-sm font-semibold transition-all duration-200
              ${activeTab === "contratos"
                ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                : "border-b-4 border-transparent"}`
            }
            onClick={() => onTabChange("contratos")}
          >
            CONTRATOS
          </TabsTrigger>
        </TabsList>
        {/* DEBUG: Forçar o botão a aparecer sempre */}
        <Button
          className="
            bg-violet-500 hover:bg-violet-600 text-white md:my-0
            font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:block
             md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
          onClick={onActionClick}
        >
          {activeTab === "clausulas"
            ? "Nova Cláusula"
            : activeTab === "anexos"
            ? "Novo Anexo"
            : "Novo Contrato"}
        </Button>
      </div>
      {/* Botão flutuante mobile */}
      {!isFormOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={onActionClick}
          aria-label={
            activeTab === "clausulas"
              ? "Nova Cláusula"
              : activeTab === "anexos"
              ? "Novo Anexo"
              : "Novo Contrato"
          }
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
} 