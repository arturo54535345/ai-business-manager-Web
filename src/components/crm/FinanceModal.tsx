import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { useAuthStore } from '../../stores/authStore'; // 👈 Importamos la memoria del usuario
import type { FinanceType, FinanceStatus } from '../../types';

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 👈 NUEVO: Definimos las categorías según el rol
const CATEGORIES_BY_ROLE = {
  worker: {
    ingreso: ['Nómina', 'Pagas Extra', 'Inversiones', 'Otros Ingresos'],
    gasto: ['Alquiler/Hipoteca', 'Supermercado', 'Suscripciones', 'Ocio', 'Transporte', 'Otros Gastos']
  },
  freelancer: {
    ingreso: ['Factura Cliente', 'Servicios', 'Consultoría', 'Otros Ingresos'],
    gasto: ['Cuota Autónomo', 'IRPF', 'IVA', 'Software/Herramientas', 'Material/Equipos', 'Gestoría', 'Otros Gastos']
  },
  company: {
    ingreso: ['Ventas B2B', 'Ventas B2C', 'Subvenciones', 'Rendimientos', 'Otros Ingresos'],
    gasto: ['Nóminas Empleados', 'Seguros Sociales', 'Impuesto Sociedades', 'Proveedores', 'Oficina/Alquiler', 'Marketing', 'Otros Gastos']
  },
  god_mode: { // En modo Dios mezclamos todo
    ingreso: ['Facturación', 'Nómina', 'Subvenciones', 'Inversiones', 'Otros Ingresos'],
    gasto: ['Impuestos/Cuotas', 'Nóminas/Empleados', 'Proveedores', 'Suscripciones/Software', 'Personal/Ocio', 'Otros Gastos']
  }
};

export default function FinanceModal({ isOpen, onClose }: FinanceModalProps) {
  const { addFinance, isLoading } = useFinanceStore();
  const { user } = useAuthStore(); // Leemos quién es el usuario
  
  // Extraemos el rol del usuario (por defecto 'god_mode')
  const userRole = (user?.preferences as any)?.role || 'god_mode';
  // Extraemos las categorías disponibles para ese rol
  const availableCategories = CATEGORIES_BY_ROLE[userRole as keyof typeof CATEGORIES_BY_ROLE] || CATEGORIES_BY_ROLE['god_mode'];

  // Estado interno del formulario
  const [formData, setFormData] = useState({
    type: 'ingreso' as FinanceType,
    amount: '',
    description: '',
    category: availableCategories.ingreso[0], // Por defecto elegimos la primera categoría disponible
    status: 'completado' as FinanceStatus,
    date: new Date().toISOString().split('T')[0],
  });

  // Efecto para cambiar la categoría por defecto si cambiamos de Ingreso a Gasto
  const handleTypeChange = (newType: FinanceType) => {
    setFormData({
      ...formData,
      type: newType,
      category: availableCategories[newType][0] // Reiniciamos la categoría a la primera de la nueva lista
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFinance({
        ...formData,
        amount: Number(formData.amount)
      });
      // Limpiamos
      setFormData({ type: 'ingreso', amount: '', description: '', category: availableCategories.ingreso[0], status: 'completado', date: new Date().toISOString().split('T')[0] });
      onClose();
    } catch (error) {
      console.error('Error al guardar movimiento', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-xl border border-neutral-200/60 w-full max-w-lg relative z-10 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Registrar Movimiento</h2>
              <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Selector de Tipo (Pestañas estilo iOS) */}
              <div className="flex p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button" onClick={() => handleTypeChange('ingreso')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.type === 'ingreso' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  Ingreso (+€)
                </button>
                <button
                  type="button" onClick={() => handleTypeChange('gasto')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.type === 'gasto' ? 'bg-white text-rose-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  Gasto (-€)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Cantidad (€) *</label>
                  <input
                    type="number" step="0.01" min="0.01" required value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-lg font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Fecha *</label>
                  <input
                    type="date" required value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Concepto *</label>
                <input
                  type="text" required value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  placeholder="Ej. Factura Cliente X, Suscripción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  {/* 👈 NUEVO: Selector Inteligente de Categoría */}
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  >
                    {availableCategories[formData.type].map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FinanceStatus })}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  >
                    <option value="completado">Pagado / Cobrado</option>
                    <option value="estimado">Pendiente / Estimado</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-neutral-100">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-md hover:shadow-lg">
                  {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}