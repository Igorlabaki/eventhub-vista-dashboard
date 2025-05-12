
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contact, Plus, Phone, Mail, Instagram, Facebook, Globe, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VenueContacts() {
  const [contacts, setContacts] = useState([
    { 
      id: "1", 
      name: "Recepção", 
      phone: "(11) 3456-7890",
      email: "recepcao@espacoevento.com.br",
      role: "Atendimento",
      type: "internal"
    },
    { 
      id: "2", 
      name: "Carlos Mendes", 
      phone: "(11) 98765-4321",
      email: "carlos@espacoevento.com.br",
      role: "Gerente",
      type: "internal"
    },
    { 
      id: "3", 
      name: "Buffet Premium", 
      phone: "(11) 94567-8901",
      email: "contato@buffetpremium.com.br",
      website: "www.buffetpremium.com.br",
      instagram: "@buffetpremium",
      type: "supplier",
      category: "Buffet"
    },
    { 
      id: "4", 
      name: "Luz & Som Eventos", 
      phone: "(11) 95678-9012",
      email: "contato@luzesom.com.br",
      website: "www.luzesom.com.br",
      instagram: "@luzesom",
      type: "supplier",
      category: "Iluminação e Som"
    }
  ]);

  return (
    <DashboardLayout title="Contatos" subtitle="Gerencie os contatos do espaço">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="internal">Equipe</TabsTrigger>
            <TabsTrigger value="supplier">Fornecedores</TabsTrigger>
          </TabsList>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="internal" className="mt-0">
          <div className="grid gap-4">
            {contacts
              .filter(contact => contact.type === 'internal')
              .map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))
            }
          </div>
        </TabsContent>
        
        <TabsContent value="supplier" className="mt-0">
          <div className="grid gap-4">
            {contacts
              .filter(contact => contact.type === 'supplier')
              .map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))
            }
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

interface ContactProps {
  contact: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role?: string;
    type: string;
    category?: string;
    website?: string;
    instagram?: string;
  };
}

function ContactCard({ contact }: ContactProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-eventhub-tertiary/20 flex items-center justify-center mr-4">
            <Contact className="h-5 w-5 text-eventhub-primary" />
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-medium text-gray-900">{contact.name}</h3>
              {contact.type === 'internal' ? (
                <span className="inline-block mt-1 sm:mt-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {contact.role}
                </span>
              ) : (
                <span className="inline-block mt-1 sm:mt-0 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {contact.category}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5 mr-2" />
                <span>{contact.phone}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5 mr-2" />
                <span>{contact.email}</span>
              </div>
              
              {contact.instagram && (
                <div className="flex items-center text-sm text-gray-500">
                  <Instagram className="h-3.5 w-3.5 mr-2" />
                  <span>{contact.instagram}</span>
                </div>
              )}
              
              {contact.website && (
                <div className="flex items-center text-sm text-gray-500">
                  <Globe className="h-3.5 w-3.5 mr-2" />
                  <span>{contact.website}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
