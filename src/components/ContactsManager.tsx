
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactsList } from './ContactsList';
import { PendingContactsManager } from './PendingContactsManager';
import { AddContactDialog } from './AddContactDialog';

export const ContactsManager = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">Lista de Discípulos</TabsTrigger>
          <TabsTrigger value="pending">Contatos Pendentes</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex justify-end">
            <AddContactDialog />
          </div>
          <ContactsList />
        </TabsContent>
        <TabsContent value="pending" className="space-y-6">
          <PendingContactsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
