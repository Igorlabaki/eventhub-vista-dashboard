import React from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

const recurringColor = "#3A6DF0"; // Azul
const esporadicColor = "#22C55E"; // Verde

export function FinancialBalanceReport({
  selectedYear,
  venueId,
}: {
  selectedYear: string;
  venueId: string;
}) {
  const { expenseAnalysis, fetchExpenseAnalysis, isLoading } =
    useExpenseStore();
  const { fetchEventsData, monthlyEventsData } = useVenueReportsStore();

  React.useEffect(() => {
    if (venueId && selectedYear) {
      fetchExpenseAnalysis({ venueId, year: selectedYear });
      fetchEventsData({ venueId, year: selectedYear, approved: true });
    }
  }, [venueId, selectedYear]);

  if (isLoading || !expenseAnalysis) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-6 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Recorrentes Anual */}
            <Skeleton className="h-5 w-24 mb-4 mx-auto" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 flex-1 mx-2" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
            {/* Recorrentes Mensal */}
            <Skeleton className="h-5 w-24 mb-4 mx-auto" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 flex-1 mx-2" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
            {/* Esporádicas Anual */}
            <Skeleton className="h-5 w-24 mb-4 mx-auto" />
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 flex-1 mx-2" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
            {/* Totais finais */}
            <div className="flex justify-between mt-8">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex justify-center mt-2">
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { total, recurring, esporadic } = expenseAnalysis;

  // Recorrentes anual
  const totalAnnual = total.annual || 1;
  const recurringAnnual = recurring.filter((r) => r.annual > 0);
  // Recorrentes mensal
  const totalMonthly = total.monthly || 1;
  const recurringMonthly = recurring.filter((r) => r.monthly > 0);
  // Esporádicas anual
  const totalEsporadic = total.esporadic || 1;
  const esporadicAnnual = esporadic.filter((e) => e.total > 0);

  // Cálculos finais
  const receitaBruta = monthlyEventsData?.approved?.total || 0;
  const despesaAnual =
    (recurringAnnual.length === 0 ? 0 : totalAnnual) +
    (esporadicAnnual.length === 0 ? 0 : totalEsporadic);
  const receitaLiquida = receitaBruta - despesaAnual;

  function renderBar({
    name,
    value,
    percent,
    color,
  }: {
    name: string;
    value: number;
    percent: number;
    color: string;
  }) {
    return (
      <div
        key={name}
        style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
      >
        <span style={{ width: 90, color: "#888", fontSize: 16 }}>{name}</span>
        <div
          style={{
            flex: 1,
            height: 20,
            background: "#e5e7eb",
            borderRadius: 10,
            marginRight: 10,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Barra colorida */}
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: color,
              transition: "width 0.4s",
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 1,
            }}
          />
          {/* Valor fora da barra colorida, logo após o preenchimento */}
          {value > 0 && (
            <span
              style={{
                position: "absolute",
                left: `calc(${percent}% + 4px)`,
                top: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                color: "#444",
                fontWeight: 500,
                fontSize: 15,
                zIndex: 2,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              R$ {value.toLocaleString("pt-BR")}
            </span>
          )}
        </div>
        <span
          style={{ width: 40, color: "#888", fontSize: 16, textAlign: "right" }}
        >
          {value > 0 ? `${percent}%` : "0%"}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white rounded-md shadow-md p-8 flex flex-col items-center">
      <h2 className="text-center text-xl font-bold mb-6 text-gray-800">
        Despesas Recorrentes
      </h2>
      {/* Recorrentes Anual */}
      <div style={{ width: "100%", marginBottom: 32 }}>
        <div className="font-semibold text-center mb-2 text-gray-700">
          Anual
        </div>
        {recurringAnnual.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mb-2">
            Nenhuma despesa cadastrada
          </div>
        ) : (
          recurringAnnual.map((item) =>
            renderBar({
              name: item.name,
              value: item.annual,
              percent: getPercent(item.annual, totalAnnual),
              color: recurringColor,
            })
          )
        )}
        <div className="text-center text-sm text-gray-500 mt-2">
          R${" "}
          {(recurringAnnual.length === 0 ? 0 : totalAnnual).toLocaleString(
            "pt-BR"
          )}
        </div>
      </div>
      {/* Recorrentes Mensal */}
      <div style={{ width: "100%", marginBottom: 32 }}>
        <div className="font-semibold text-center mb-2 text-gray-700">
          Mensal
        </div>
        {recurringMonthly.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mb-2">
            Nenhuma despesa cadastrada
          </div>
        ) : (
          recurringMonthly.map((item) =>
            renderBar({
              name: item.name,
              value: item.monthly,
              percent: getPercent(item.monthly, totalMonthly),
              color: recurringColor,
            })
          )
        )}
        <div className="text-center text-sm text-gray-500 mt-2">
          R${" "}
          {(recurringMonthly.length === 0 ? 0 : totalMonthly).toLocaleString(
            "pt-BR"
          )}
        </div>
      </div>
      <h2 className="text-center text-xl font-bold mb-2 text-gray-800">
        Despesas esporádicas
      </h2>
      {/* Esporádicas Anual */}
      <div style={{ width: "100%" }}>
        <div className="font-semibold text-center mb-2 text-gray-700">
          Anual
        </div>
        {esporadicAnnual.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mb-2">
            Nenhuma despesa cadastrada
          </div>
        ) : (
          esporadicAnnual.map((item) =>
            renderBar({
              name: item.name,
              value: item.total,
              percent: getPercent(item.total, totalEsporadic),
              color: recurringColor,
            })
          )
        )}
        <div className="text-center text-sm text-gray-500 mt-2">
          R${" "}
          {(esporadicAnnual.length === 0 ? 0 : totalEsporadic).toLocaleString(
            "pt-BR"
          )}
        </div>
      </div>
      {/* Seção final igual ao app */}
      <div className="w-full flex flex-col items-center mt-8 gap-3">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">
            Receita Bruta :{" "}
            <span className="font-semibold">
              R$ {receitaBruta.toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            Despesa anual :{" "}
            <span className="font-semibold">
              R$ {despesaAnual.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700">
          Receita líquida :{" "}
          <span className="font-semibold">
            R$ {receitaLiquida.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}
