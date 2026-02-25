import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinanceStore } from '../stores/financeStore';
import { Plus, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Trash2, Calendar } from 'lucide-react';
import Alert from '../components/common/Alert';
import FinanceModal from '../components/crm/FinanceModal';

const containerVariants: Variants ={
    hidden: {opacity: 0},
    visible: {opacity: 1, y: 0, transition: {type: 'spring', stiffness: 300, damping: 24}}
};
const itemVariants: Variants = {
    hidden: {opacity: 0, y: 20},
    visible: {opacity: 1, y: 0, transition: {type: 'spring', stiffness: 300, damping: 24}}
};
//el encargado de formatear el dinero siempre que haya un cambio
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'EUR'}).format(amount);
};
//el encargado de formatear las fechas
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {day: 'numeric', month: 'short', year: 'numeric'});
};
//tarjeta reutilizable para los numeros grandes
const SummaryCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

export default function Finance(){
    const {finances, summary, isLoading, error, fetchFinances, fetchSummary, deleteFinance} = useFinanceStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    //nada mas entre el cliente se cargara el resumen y lista de movimientos
    useEffect(()=>{
        fetchSummary();
        fetchFinances();
    }, []);

    const handleDelete = async (id: string) =>{
        if(window.confirm('¿Seguro que quieres eliminar este movimiento de forma permanente')){
            await deleteFinance(id);
        }
    };
    return(
        <div className="space-y-8 pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finanzas</h1>
          <p className="text-sm text-gray-500 mt-1">Control de ingresos, gastos y rentabilidad de tu negocio.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Movimiento
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* TARJETAS DE RESUMEN (LOS NÚMEROS GRANDES) */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <SummaryCard 
          title="Beneficio Neto Total" 
          value={summary ? formatMoney(summary.netProfit) : '0,00 €'} 
          icon={DollarSign} 
          colorClass={summary && summary.netProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} 
        />
        <SummaryCard 
          title="Ingresos Totales" 
          value={summary ? formatMoney(summary.totalIncome) : '0,00 €'} 
          icon={TrendingUp} 
          colorClass="bg-green-50 text-green-600" 
        />
        <SummaryCard 
          title="Gastos Totales" 
          value={summary ? formatMoney(summary.totalExpenses) : '0,00 €'} 
          icon={TrendingDown} 
          colorClass="bg-red-50 text-red-600" 
        />
      </motion.div>

      {/* HISTORIAL DE MOVIMIENTOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Últimos Movimientos</h2>
        </div>

        {isLoading && finances.length === 0 ? (
           <div className="p-12 text-center text-gray-400">Cargando historial...</div>
        ) : finances.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No hay movimientos financieros registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {finances.map((finance) => (
              <motion.div 
                key={finance._id} 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group"
              >
                {/* Lado Izquierdo: Icono + Detalles */}
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full flex-shrink-0 ${finance.type === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {finance.type === 'ingreso' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">{finance.description}</h4>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1 space-x-3">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(finance.date)}</span>
                      <span className="hidden sm:inline-block px-2 py-0.5 bg-gray-100 rounded-md">{finance.category}</span>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Cantidad + Botón Borrar */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`font-bold text-base sm:text-lg ${finance.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {finance.type === 'ingreso' ? '+' : '-'}{formatMoney(finance.amount)}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{finance.status}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(finance._id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FinanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
    );
};