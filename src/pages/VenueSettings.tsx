
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  ImageIcon, 
  CreditCard, 
  Bell, 
  Users, 
  ShieldCheck,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VenueSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Mock venue data
  const [venueData, setVenueData] = useState({
    name: "Espaço Villa Verde",
    email: "contato@villaverde.com",
    street: "Rua das Palmeiras",
    streetNumber: "1500",
    complement: "Próximo ao Shopping",
    neighborhood: "Jardim Paulista",
    city: "São Paulo",
    state: "SP",
    cep: "01452-001",
    checkIn: "14:00",
    checkOut: "12:00",
    hasOvernightStay: true,
    pricingModel: "PER_PERSON",
    pricePerPerson: "150.00",
    maxGuest: "350",
  });
  
  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    whatsappNotifications: true,
    newBudgetAlert: true,
    visitReminderAlert: true,
    eventReminderAlert: true,
    paymentAlert: true,
  });

  const handleSaveGeneral = () => {
    toast({
      title: "Sucesso",
      description: "Configurações gerais salvas com sucesso!",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Sucesso",
      description: "Preferências de notificação atualizadas!",
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setVenueData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <DashboardLayout title="Configurações" subtitle="Gerencie as configurações do seu espaço">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-8">
          <TabsTrigger value="general" onClick={() => setActiveTab("general")}>
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="images" onClick={() => setActiveTab("images")}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Imagens
          </TabsTrigger>
          <TabsTrigger value="payments" onClick={() => setActiveTab("payments")}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="notifications" onClick={() => setActiveTab("notifications")}>
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="team" onClick={() => setActiveTab("team")}>
            <Users className="h-4 w-4 mr-2" />
            Equipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveGeneral(); }}>
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>
                  Atualize as informações básicas do seu espaço.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Espaço</Label>
                    <Input
                      id="name"
                      value={venueData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={venueData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">Endereço</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="street">Rua/Avenida</Label>
                      <Input
                        id="street"
                        value={venueData.street}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="streetNumber">Número</Label>
                      <Input
                        id="streetNumber"
                        value={venueData.streetNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={venueData.complement}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={venueData.neighborhood}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={venueData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={venueData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={venueData.cep}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">Horários de Check-in/out</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="checkIn">Check-in</Label>
                      <Input
                        id="checkIn"
                        type="time"
                        value={venueData.checkIn}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="checkOut">Check-out</Label>
                      <Input
                        id="checkOut"
                        type="time"
                        value={venueData.checkOut}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox 
                        id="hasOvernightStay" 
                        checked={venueData.hasOvernightStay}
                        onCheckedChange={(checked) =>
                          setVenueData({ ...venueData, hasOvernightStay: !!checked })
                        }
                      />
                      <Label htmlFor="hasOvernightStay">Permite pernoite</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">Preços e Capacidade</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="pricingModel">Modelo de precificação</Label>
                      <Select 
                        value={venueData.pricingModel} 
                        onValueChange={(value) => setVenueData({...venueData, pricingModel: value})}
                      >
                        <SelectTrigger id="pricingModel">
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PER_PERSON">Por pessoa</SelectItem>
                          <SelectItem value="PER_DAY">Por dia</SelectItem>
                          <SelectItem value="PER_PERSON_DAY">Por pessoa/dia</SelectItem>
                          <SelectItem value="PER_PERSON_HOUR">Por pessoa/hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {venueData.pricingModel === "PER_PERSON" && (
                      <div className="grid gap-2">
                        <Label htmlFor="pricePerPerson">Preço por pessoa (R$)</Label>
                        <Input
                          id="pricePerPerson"
                          value={venueData.pricePerPerson}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                    
                    <div className="grid gap-2">
                      <Label htmlFor="maxGuest">Capacidade máxima (pessoas)</Label>
                      <Input
                        id="maxGuest"
                        value={venueData.maxGuest}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Espaço</CardTitle>
              <CardDescription>
                Gerencie as imagens exibidas do seu espaço.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border relative group"
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm">Editar</Button>
                      <Button variant="destructive" size="sm">Remover</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Adicionar Imagens
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <CardDescription>
                Gerencie as opções de pagamento para o seu espaço.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Métodos de Pagamento Aceitos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="acceptCreditCard" defaultChecked />
                      <Label htmlFor="acceptCreditCard">Cartão de Crédito</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="acceptPix" defaultChecked />
                      <Label htmlFor="acceptPix">PIX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="acceptBankTransfer" defaultChecked />
                      <Label htmlFor="acceptBankTransfer">Transferência Bancária</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="acceptCash" />
                      <Label htmlFor="acceptCash">Dinheiro</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">Dados Bancários</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bankName">Banco</Label>
                      <Select defaultValue="itau">
                        <SelectTrigger id="bankName">
                          <SelectValue placeholder="Selecione o banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="itau">Itaú</SelectItem>
                          <SelectItem value="bradesco">Bradesco</SelectItem>
                          <SelectItem value="santander">Santander</SelectItem>
                          <SelectItem value="bb">Banco do Brasil</SelectItem>
                          <SelectItem value="caixa">Caixa Econômica</SelectItem>
                          <SelectItem value="nubank">Nubank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountType">Tipo de Conta</Label>
                      <Select defaultValue="checking">
                        <SelectTrigger id="accountType">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Corrente</SelectItem>
                          <SelectItem value="savings">Poupança</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="branch">Agência</Label>
                      <Input id="branch" defaultValue="1234" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="account">Conta</Label>
                      <Input id="account" defaultValue="12345-6" />
                    </div>
                  </div>
                  
                  <div className="grid gap-2 mt-4">
                    <Label htmlFor="accountHolder">Titular da Conta</Label>
                    <Input id="accountHolder" defaultValue="Villa Verde Eventos Ltda" />
                  </div>
                  
                  <div className="grid gap-2 mt-4">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveNotifications(); }}>
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Escolha como deseja ser notificado sobre eventos e atualizações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Canais de Notificação</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="emailNotifications" 
                          checked={notificationSettings.emailNotifications} 
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, emailNotifications: !!checked})
                          }
                        />
                        <Label htmlFor="emailNotifications">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="whatsappNotifications" 
                          checked={notificationSettings.whatsappNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, whatsappNotifications: !!checked})
                          }
                        />
                        <Label htmlFor="whatsappNotifications">WhatsApp</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Tipos de Notificação</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="newBudgetAlert" 
                          checked={notificationSettings.newBudgetAlert}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, newBudgetAlert: !!checked})
                          }
                        />
                        <Label htmlFor="newBudgetAlert">Novos orçamentos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="visitReminderAlert" 
                          checked={notificationSettings.visitReminderAlert}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, visitReminderAlert: !!checked})
                          }
                        />
                        <Label htmlFor="visitReminderAlert">Lembretes de visitas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="eventReminderAlert" 
                          checked={notificationSettings.eventReminderAlert}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, eventReminderAlert: !!checked})
                          }
                        />
                        <Label htmlFor="eventReminderAlert">Lembretes de eventos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="paymentAlert" 
                          checked={notificationSettings.paymentAlert}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, paymentAlert: !!checked})
                          }
                        />
                        <Label htmlFor="paymentAlert">Pagamentos recebidos</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Equipe</CardTitle>
              <CardDescription>
                Adicione e gerencie membros da equipe e suas permissões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Membros da Equipe</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Mariana Silva", email: "mariana@villaverde.com", role: "Administrador" },
                      { name: "João Paulo", email: "joao@villaverde.com", role: "Gerente" },
                      { name: "Carla Souza", email: "carla@villaverde.com", role: "Atendimento" },
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                            {member.role}
                          </span>
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="destructive" size="sm">Remover</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </Button>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Adicionar Membro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
