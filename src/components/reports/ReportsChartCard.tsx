import React from "react";

const months = [
  "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
  "jul.", "ago.", "set.", "out.", "nov.", "dez."
];

const trafficSources = [
  { name: "Instagram", key: "instagram", color: "#E94F4A" },
  { name: "TikTok", key: "tikTok", color: "#3ED6C5" },
  { name: "Outros", key: "other", color: "#3A6DF0" },
  { name: "Google", key: "google", color: "#A259F7" },
  { name: "Amigos", key: "friend", color: "#FFD600" },
  { name: "Airbnb", key: "airbnb", color: "#F75C9C" },
  { name: "Facebook", key: "facebook", color: "#3B5998" }
];

function getMax(arr: { value: number }[]) {
  return Math.max(...arr.map(x => x.value), 1);
}

interface MonthData {
  month: string;
  count: number;
  total: number;
  guestNumber: number;
}

interface TrafficSource {
  name: string;
  count: number;
}

interface ReportsChartCardProps {
  title: string;
  total: { count: number; total: number; guestNumber: number };
  monthsData: MonthData[];
  trafficData: TrafficSource[];
  type: "eventos" | "orçamentos";
  approvedCount?: number;
  orcamentosCount?: number;
}

export const ReportsChartCard: React.FC<ReportsChartCardProps> = ({
  title,
  total,
  monthsData,
  trafficData,
  type,
  approvedCount,
  orcamentosCount
}) => {
  // Meses proporcionais ao total.count
  const totalMeses = total.count || 1;
  const data = months.map((m) => {
    const found = monthsData?.find(item => item.month === m);
    const value = found?.count || 0;
    const percent = (value / totalMeses) * 100;
    return {
      name: m,
      value,
      percent
    };
  });

  // Fontes proporcionais ao total de cliques
  const totalCliques = trafficData.reduce((sum, t) => sum + t.count, 0) || 1;
  let traffic = trafficSources.map(src => {
    const found = trafficData.find(t => t.name.toLowerCase() === src.key.toLowerCase());
    const value = found?.count || 0;
    const percent = (value / totalCliques) * 100;
    return {
      name: src.name,
      value,
      color: src.color,
      percent
    };
  });
  // Ordenar do maior para o menor valor
  traffic = traffic.sort((a, b) => b.value - a.value);

  // Estatísticas
  const mediaPessoas = Math.round(total.guestNumber / (total.count || 1));
  const valorPorOrcamento = total.total / (total.count || 1);
  const valorPorPessoa = total.total / (total.guestNumber || 1);

  // Calcular taxa de conversão
  const totalOrcamentos = typeof orcamentosCount === 'number' ? orcamentosCount : (typeof total.count === 'number' ? total.count : 0);
  const totalAprovados = typeof approvedCount === 'number' ? approvedCount : 0;
  const taxaConversao = totalOrcamentos > 0 ? (totalAprovados / totalOrcamentos) * 100 : 0;

  return (
    <div className="w-full mx-auto bg-white rounded-md shadow-md p-8 flex flex-col items-center">
      {/* Gráfico de meses */}
      <div style={{ width: "100%", margin: "0 auto 24px auto" }}>
        {data.map((item, idx) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ width: 40, color: "#888", fontSize: 16 }}>{item.name}</span>
            <div style={{
              flex: 1,
              height: 20,
              background: "#e5e7eb",
              borderRadius: 12,
              marginRight: 10,
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Barra colorida */}
              <div style={{
                width: `${item.percent}%`,
                height: "100%",
                background: "#4A90E2",
                transition: "width 0.4s",
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 1
              }} />
              {/* Número fora da barra colorida, logo após o preenchimento */}
              {item.value > 0 && (
                <span style={{
                  position: "absolute",
                  left: `calc(${item.percent}% + 4px)` ,
                  top: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontWeight: 500,
                  fontSize: 15,
                  zIndex: 2,
                  pointerEvents: "none",
                  whiteSpace: "nowrap"
                }}>
                  {item.value}
                </span>
              )}
            </div>
            <span  style={{ width: 40, color: "#888", fontSize: 16, textAlign: "right" }}>
              {item.value > 0 ? `${Math.round(item.percent)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col gap-2">
          <span className="text-sm md:text-base font-medium text-gray-600">{total.count} {type}</span>
          <span className="text-sm md:text-base font-medium text-gray-600">{mediaPessoas} pessoas em média</span>
        </div>
        <div className="flex flex-col gap-2 justify-end items-end">
          <span className="text-sm md:text-base font-medium text-gray-600">R$ {valorPorOrcamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})} por {type.slice(0, -1)}</span>
          <span className="text-sm md:text-base font-medium text-gray-600">R$ {valorPorPessoa.toLocaleString('pt-BR', {minimumFractionDigits: 2})} por pessoa</span>
        </div>
      </div>

      {/* Taxa de conversão */}
      <div  className="text-sm md:text-base font-medium text-gray-600 mt-4 mb-10">
        Taxa de conversão {taxaConversao.toFixed(1)}%
      </div>

      {/* Gráfico de fontes */}
      <div style={{ width: "100%", margin: "0 auto" }}>
        {traffic.map((item, idx) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <span style={{ width: 90, color: "#888", fontSize: 16 }}>{item.name}:</span>
            <div style={{
              flex: 1,
              height: 20,
              background: "#e5e7eb",
              borderRadius: 10,
              marginRight: 10,
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Barra colorida */}
              <div style={{
                width: `${item.percent}%`,
                height: "100%",
                background: item.color,
                transition: "width 0.4s",
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 1
              }} />
              {/* Número fora da barra colorida, logo após o preenchimento */}
              {item.value > 0 && (
                <span style={{
                  position: "absolute",
                  left: `calc(${item.percent}% + 4px)` ,
                  top: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontWeight: 500,
                  fontSize: 15,
                  zIndex: 2,
                  pointerEvents: "none",
                  whiteSpace: "nowrap"
                }}>
                  {item.value}
                </span>
              )}
            </div>
            <span style={{ width: 40, color: "#888", fontSize: 16, textAlign: "right" }}>
              {item.value > 0 ? `${Math.round(item.percent)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}; 