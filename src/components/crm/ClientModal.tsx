import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useClientStore } from '../../stores/clientStore';
import type { Client, ClientCategory } from '../../types';

interface ClientCardProps{
    isOpen: boolean;
    onClose: ()=> void;
    clientToEdit?: Client|null//si se le pasa un cliente es para que lo edite si no es para que lo cree
}

const CATEGORIES: ClientCategory[]= ['General', 'Prospect', 'Potencial','Active','VIP','Inactive'];
export default function ClientModal({isOpen, onClose, clientToEdit}: ClientCardProps){
    const {addClient, updateClient, isLoading} = useClientStore();

    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        category: 'General' as ClientCategory,
    });

    useEffect(()=>{
        if(clientToEdit){
            setFormData({
                name: clientToEdit.name,
                companyName: clientToEdit.companyName || '',
                email: clientToEdit.email || '',
                phone: clientToEdit.phone || '',
                category: clientToEdit.category,
            });
        } else{
            //si el cliente es nuevo se limpia los campos
            setFormData({name: '', companyName: '', email: '', phone: '', category: 'General'});
        }
    }, [clientToEdit, isOpen]);

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        try{
            if(clientToEdit){
                await updateClient(clientToEdit._id, formData);
            }else {
                await addClient(formData);
            }
            onClose();
        }catch(error){
            console.error('Error al guardar el cliente', error);
        }
    };

    return(
        <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* El fondo oscuro que oscurece la pantalla de atrás */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* La Ventana Blanca */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg relative z-10 overflow-hidden"
          >
            {/* Cabecera de la ventana */}
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {clientToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
              </h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="label">Nombre del Contacto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field bg-gray-50 focus:bg-white"
                  placeholder="Ej. Ana García"
                />
              </div>

              <div>
                <label className="label">Empresa</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="input-field bg-gray-50 focus:bg-white"
                  placeholder="Ej. Tech Solutions SL"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field bg-gray-50 focus:bg-white"
                    placeholder="ana@empresa.com"
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field bg-gray-50 focus:bg-white"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="label">Estado / Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ClientCategory })}
                  className="input-field bg-gray-50 focus:bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Botones de acción */}
              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-gray-50">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex items-center shadow-lg shadow-primary-500/20">
                  {isLoading ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    )
}