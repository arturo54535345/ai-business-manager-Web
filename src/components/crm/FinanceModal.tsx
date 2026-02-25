import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import type { FinanceType, FinanceStatus } from '../../types';

interface FinanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FinanceModal({ isOpen, onClose}: FinanceModalProps){
    const {addFinance, isLoading} = useFinanceStore();

    //estado interno del formulario
    const [formData, setFormData] = useState({
        type: 'ingreso' as FinanceType,
        amount: '',
        description: '',
        category: 'General',
        status: 'completado' as FinanceStatus,
        date: new Date(). toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            //el amount lo paso a numero antes de que sea enviado
            await addFinance({
                ...formData,
                amount: Number(formData.amount)
            });
            //limpio el formulario para que la proxima vez que entren este limpio
            setFormData({type: 'ingreso', amount: '', description: '', category: 'General', status: 'completado', date: new Date().toISOString().split('T')[0] });
            onClose();
        }catch(error){
            console.error('Error al guardar movimiento', error);
        }
    };
    return(
        <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Ventana Blanca */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg relative z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Registrar Movimiento</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Pestañas gigantes para elegir Ingreso o Gasto */}
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'ingreso' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    formData.type === 'ingreso' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingreso (+€)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'gasto' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    formData.type === 'gasto' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Gasto (-€)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cantidad (€) *</label>
                  <input
                    type="number" step="0.01" min="0.01" required value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field bg-gray-50 focus:bg-white text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="label">Fecha *</label>
                  <input
                    type="date" required value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="label">Descripción *</label>
                <input
                  type="text" required value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field bg-gray-50 focus:bg-white"
                  placeholder="Ej. Factura Cliente X, Suscripción de software..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoría</label>
                  <input
                    type="text" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field bg-gray-50 focus:bg-white"
                    placeholder="Ej. Servicios, Software, Equipo"
                  />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FinanceStatus })}
                    className="input-field bg-gray-50 focus:bg-white"
                  >
                    <option value="completado">Pagado / Cobrado</option>
                    <option value="estimado">Pendiente / Estimado</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-gray-50">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    )
}