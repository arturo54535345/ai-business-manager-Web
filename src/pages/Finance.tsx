import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinanceStore } from '../stores/financeStore';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Trash2, Calendar, FileText, X } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FinanceModal from '../components/crm/FinanceModal';
import type { Finance } from '../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Formateador de dinero (Ej: 1.000,00 €)
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);
};

// Formateador de fecha (Ej: 25 oct)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// Componente para la Tarjeta de Resumen (Los grandes números de arriba)
const SummaryCard = ({ title, value, type }: { title: string, value: number, type: 'net' | 'income' | 'expense' }) => (
  <motion.div variants={fadeUp} className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/60 relative overflow-hidden group">
    <div className="relative z-10">
      <p className="text-sm font-semibold text-neutral-500 mb-2">{title}</p>
      <h3 className={`text-4xl font-bold tracking-tight ${
        type === 'income' ? 'text-emerald-600' : type === 'expense' ? 'text-rose-600' : 'text-neutral-900'
      }`}>
        {type === 'expense' && value > 0 ? '-' : ''}{formatMoney(value)}
      </h3>
    </div>
    {/* Icono de fondo decorativo */}
    <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
      {type === 'income' ? <TrendingUp className="w-24 h-24 text-emerald-900" /> : 
       type === 'expense' ? <TrendingDown className="w-24 h-24 text-rose-900" /> : 
       <FileText className="w-24 h-24 text-neutral-900" />}
    </div>
  </motion.div>
);

export default function Finance() {
  const { finances, summary, isLoading, fetchFinances, fetchSummary, deleteFinance } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Memoria para el movimiento en el que hagamos clic (Para ver sus detalles)
  const [selectedTransaction, setSelectedTransaction] = useState<Finance | null>(null);

  useEffect(() => {
    fetchSummary();
    fetchFinances();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este movimiento? Afectará a los cálculos totales.')) {
      await deleteFinance(id);
      setSelectedTransaction(null); // Cerramos el detalle si estaba abierto
    }
  };

  // --- MATEMÁTICAS PARA LOS GRÁFICOS ---
  // 1. Datos para el Círculo (Donut)
  const donutData = [
    { name: 'Ingresos', value: summary?.totalIncome || 0, color: '#10b981' }, // Verde Emerald
    { name: 'Gastos', value: summary?.totalExpenses || 0, color: '#f43f5e' }  // Rojo Rose
  ];

  // 2. Datos para el Gráfico de Barras (Agrupar por días)
  // useMemo hace que estas matemáticas solo se calculen si la lista "finances" cambia, para no saturar la web
  const chartData = useMemo(() => {
    const groupedData: Record<string, { date: string, income: number, expense: number }> = {};

    // Damos la vuelta a la lista para procesar desde el más antiguo al más nuevo
    const reversedFinances = [...finances].reverse();

    reversedFinances.forEach(item => {
      const dateKey = formatDate(item.date); // Ej: "25 oct"
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (item.type === 'ingreso') {
        groupedData[dateKey].income += item.amount;
      } else {
        groupedData[dateKey].expense += item.amount;
      }
    });

    // Convertimos el objeto agrupado en una lista que recharts pueda leer
    return Object.values(groupedData).slice(-10); // Solo mostramos los últimos 10 días con movimientos
  }, [finances]);

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Finanzas</h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">Controla tus números, ingresos y gastos al céntimo.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Registrar Movimiento
        </button>
      </div>

      {/* TARJETAS DE RESUMEN GIGANTES */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Beneficio Neto Total" value={summary?.netProfit || 0} type="net" />
        <SummaryCard title="Ingresos Totales" value={summary?.totalIncome || 0} type="income" />
        <SummaryCard title="Gastos Totales" value={summary?.totalExpenses || 0} type="expense" />
      </motion.div>

      {/* ZONA DE GRÁFICOS (WALL STREET) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO DE DONUT (1 Espacio) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-sm font-semibold text-neutral-500 w-full text-left mb-4">Balance Proporcional</h3>
          {(summary?.totalIncome === 0 && summary?.totalExpenses === 0) ? (
            <div className="text-neutral-400 text-sm flex items-center justify-center h-full">Sin datos para mostrar</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => formatMoney(value || 0)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex space-x-4 mt-2 text-xs font-medium text-neutral-600">
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Ingresos</span>
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div> Gastos</span>
          </div>
        </motion.div>

        {/* GRÁFICO DE BARRAS (2 Espacios) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-sm font-semibold text-neutral-500 mb-6">Tendencia de los últimos días</h3>
          {chartData.length === 0 ? (
            <div className="text-neutral-400 text-sm flex items-center justify-center h-full flex-1">Añade movimientos para ver las gráficas</div>
          ) : (
            <div className="flex-1 w-full h-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} tickFormatter={(value) => `${value}€`} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} formatter={(value: number | undefined) => formatMoney(value || 0)} />
                  <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* HISTORIAL Y DETALLE (Layout dividido si hay un movimiento seleccionado) */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LISTA DE MOVIMIENTOS */}
        <div className={`bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden flex-1 transition-all duration-300 ${selectedTransaction ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Historial de Movimientos</h2>
          </div>

          {isLoading && finances.length === 0 ? (
             <div className="p-12 text-center text-neutral-400">Cargando la bóveda...</div>
          ) : finances.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-medium">Libro mayor vacío</p>
              <p className="text-neutral-500 text-sm mt-1">Registra tu primera factura o gasto.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100/80">
              {finances.map((finance) => (
                <div 
                  key={finance._id} 
                  onClick={() => setSelectedTransaction(finance)}
                  className={`p-4 sm:p-5 transition-colors flex items-center justify-between group cursor-pointer ${
                    selectedTransaction?._id === finance._id ? 'bg-neutral-50 border-l-4 border-neutral-900' : 'hover:bg-neutral-50/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${finance.type === 'ingreso' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {finance.type === 'ingreso' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">{finance.description}</h4>
                      <div className="flex items-center text-xs text-neutral-500 mt-1 font-medium">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 opacity-70" /> {formatDate(finance.date)}</span>
                        <span className="mx-2 opacity-50">•</span>
                        <span>{finance.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold text-base block ${finance.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {finance.type === 'ingreso' ? '+' : '-'}{formatMoney(finance.amount)}
                    </span>
                    <span className="text-xs text-neutral-400 capitalize">{finance.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 👈 NUEVO: VISTA DE DETALLE LATERAL (Aparece cuando haces clic en un movimiento) */}
        {selectedTransaction && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 bg-white rounded-[2rem] border border-neutral-200/60 shadow-lg p-6 relative flex flex-col h-fit sticky top-24"
          >
            <button 
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-8 mt-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                selectedTransaction.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {selectedTransaction.type === 'ingreso' ? 'Ingreso Registrado' : 'Gasto Registrado'}
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 leading-tight pr-8">{selectedTransaction.description}</h3>
            </div>

            <div className="space-y-5 mb-8 flex-1">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Cantidad</p>
                <p className={`text-3xl font-bold ${selectedTransaction.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatMoney(selectedTransaction.amount)}
                </p>
              </div>

              <div className="w-full h-px bg-neutral-100"></div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500 mb-1">Fecha</p>
                  <p className="text-sm font-semibold text-neutral-900">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 mb-1">Categoría</p>
                  <p className="text-sm font-semibold text-neutral-900">{selectedTransaction.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 mb-1">Estado</p>
                  <p className="text-sm font-semibold text-neutral-900 capitalize">{selectedTransaction.status}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleDelete(selectedTransaction._id)}
              className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar Movimiento
            </button>
          </motion.div>
        )}
      </div>

      <FinanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}