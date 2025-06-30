import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus } from "lucide-react";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ItemListVenueResponse } from "@/types/venue";

const mockDescriptions = [
  "Casa completa na paradisíaca praia de Guaecá",
  "Espaço moderno para festas e eventos",
  "Ambiente aconchegante e sofisticado para reuniões",
  "Salão amplo com estrutura para casamentos",
];

const mockAmenities = [
  [
    "Piscina privativa e amplo jardim",
    "Ideal para famílias e grupos de amigos",
    "Aconchegante e em meio à natureza",
  ],
  [
    "Sistema de som e iluminação profissional",
    "Piscina, recepção e área para refeições",
    "Segurança e estrutura completa",
  ],
  ["Ar-condicionado", "Wi-Fi de alta velocidade", "Cozinha equipada"],
  ["Estacionamento para 50 carros", "Área kids", "Espaço gourmet"],
];

interface SimulacaoData {
  nome: string;
  descricao: string;
  comodidades: string;
  imagem: string;
}

// Componente de lista de espaços
function VenuesList({ venues, isLoading, onCreateClick }: {
  venues: ItemListVenueResponse[];
  isLoading: boolean;
  onCreateClick: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Button onClick={onCreateClick} className="bg-green-700 hover:bg-green-800">
          <Plus className="h-4 w-4 mr-2" />
          Simular Espaço
        </Button>
      </div>
      

      {/* Lista de venues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-100 rounded-xl animate-pulse"
            />
          ))
        ) : venues.length > 0 ? (
          venues.map((venue, idx) => (
            <div
              key={venue.id}
              className="rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col"
            >
              {venue.images?.[0]?.imageUrl && (
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={venue.images[0].imageUrl}
                    alt={venue.name}
                    className="object-cover w-full h-full"
                  />
                  <span className="absolute top-4 left-4 bg-green-700 text-white text-sm font-semibold px-4 py-1 rounded-lg shadow">
                    {venue.name}
                  </span>
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-500 mb-1 font-medium">
                 {venue.city} / {venue.state}
                </p>
                <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                <ul className="mb-4 space-y-1">
                  <li className="text-gray-500 font-semibold text-sm">
                    {venue.description}
                  </li>
                  {mockAmenities[idx % mockAmenities.length].map(
                    (amenity, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        {amenity}
                      </li>
                    )
                  )}
                </ul>
                <Button
                  asChild
                  className={
                    idx % 2 === 0
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-black hover:bg-gray-900"
                  }
                  size="lg"
                >
                  <a
                    href={`#`} // Trocar para link real do espaço se existir
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar {venue.name}{" "}
                    <ExternalLink className="h-4 w-4 ml-2 inline" />
                  </a>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-gray-500 py-16">
            Nenhum espaço cadastrado
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de formulário de simulação
function SimulacaoForm({ 
  simulacao, 
  setSimulacao, 
  onCancel 
}: {
  simulacao: SimulacaoData;
  setSimulacao: (data: SimulacaoData) => void;
  onCancel: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Simular Espaço</h2>
        <Button variant="outline" onClick={onCancel}>
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="nome">Nome do Espaço</Label>
            <Input
              id="nome"
              type="text"
              value={simulacao.nome}
              onChange={e => setSimulacao({ ...simulacao, nome: e.target.value })}
              placeholder="Ex: Guaecá House"
            />
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={simulacao.descricao}
              onChange={e => setSimulacao({ ...simulacao, descricao: e.target.value })}
              placeholder="Descreva o espaço..."
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label htmlFor="comodidades">Comodidades (separe por vírgula)</Label>
            <Input
              id="comodidades"
              type="text"
              value={simulacao.comodidades}
              onChange={e => setSimulacao({ ...simulacao, comodidades: e.target.value })}
              placeholder="Piscina, Jardim, Wi-Fi..."
            />
          </div>
          
          <div>
            <Label htmlFor="imagem">Imagem (URL)</Label>
            <Input
              id="imagem"
              type="text"
              value={simulacao.imagem}
              onChange={e => setSimulacao({ ...simulacao, imagem: e.target.value })}
              placeholder="Cole o link da imagem"
            />
          </div>
        </div>

        {/* Preview */}
        <div>
          <Label className="text-lg font-semibold mb-4 block">Preview do Card</Label>
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col">
            {simulacao.imagem && (
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={simulacao.imagem}
                  alt={simulacao.nome}
                  className="object-cover w-full h-full"
                />
                <span className="absolute top-4 left-4 bg-green-700 text-white text-sm font-semibold px-4 py-1 rounded-lg shadow">
                  {simulacao.nome || "Nome do Espaço"}
                </span>
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-2">{simulacao.nome || "Nome do Espaço"}</h3>
              <p className="text-gray-700 mb-2">{simulacao.descricao || "Descrição do espaço..."}</p>
              <ul className="mb-2 space-y-1">
                {(simulacao.comodidades ? simulacao.comodidades.split(",") : ["Comodidade 1", "Comodidade 2"]).map((amenity, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    {amenity.trim()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationWebsiteVenues() {
  const { currentOrganization: organization } = useOrganizationStore();
  const { venues, isLoading, fetchVenues } = useVenueStore();
  const { user } = useUserStore();
  const [showForm, setShowForm] = useState(false);
  const [simulacao, setSimulacao] = useState<SimulacaoData>({
    nome: "",
    descricao: "",
    comodidades: "",
    imagem: "",
  });

  useEffect(() => {
    if (organization?.id && user?.id) {
      fetchVenues({ organizationId: organization.id, userId: user.id });
    }
  }, [organization?.id, user?.id, fetchVenues]);

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleCancelCreate = () => {
    setShowForm(false);
    setSimulacao({
      nome: "",
      descricao: "",
      comodidades: "",
      imagem: "",
    });
  };

  return (
    <DashboardLayout
      title="Espaços do Site"
      subtitle="Escolha e gerencie os espaços que aparecem no site da sua organização"
    >
      <AnimatedFormSwitcher
        showForm={showForm}
        list={
          <VenuesList
            venues={venues}
            isLoading={isLoading}
            onCreateClick={handleCreateClick}
          />
        }
        form={
          <SimulacaoForm
            simulacao={simulacao}
            setSimulacao={setSimulacao}
            onCancel={handleCancelCreate}
          />
        }
      />
    </DashboardLayout>
  );
}
