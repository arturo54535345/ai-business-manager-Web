import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type{ Variants } from 'framer-motion';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardStats } from '../services/dashboard.service';
import { DollarSign, TrendingUp, TrendingDown, Users, CheckCircle, Clock } from 'lucide-react';
import Alert from '../components/common/Alert';

// 1. LEYES DE LA FÍSICA (Coreografía en cascada)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 } // Las tarjetas aparecen con 0.1s de diferencia
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// 2. EL TRUCO PREMIUM: Un formateador automático de dinero (para que 1000 se vea como 1.000,00 €)
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount);
};

// 3. LA TARJETA REUTILIZABLE (Evitamos repetir código 7 veces)
const StatCard = ({ title, value, icon: Icon, subtitle, colorClass }: any) => (
  <motion.div 
    variants={itemVariants} 
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {/* El icono cambia de color según si es positivo (verde), negativo (rojo) o neutro (azul) */}
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

// 4. LA PANTALLA PRINCIPAL
export default function Dashboard() {
  // La memoria a corto plazo de la pantalla
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect se ejecuta automáticamente SOLAMENTE una vez cuando entramos a la página
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError('No pudimos cargar tus métricas. Revisa tu conexión.');
      } finally {
        setIsLoading(false); // Apagamos la rueda de carga
      }
    };
    loadData();
  }, []);

  // Si está pensando, mostramos una rueda giratoria elegante
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Si hay error o no hay datos, lo mostramos y paramos aquí
  if (error) return <Alert type="error" message={error} />;
  if (!stats) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10">
      
      {/* Cabecera de Finanzas */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900">Resumen Financiero</h1>
        <p className="text-gray-500">Un vistazo rápido al estado de tu negocio este mes.</p>
      </motion.div>

      {/* Grid de Finanzas (Se adapta: 1 columna en móvil, 2 en tablet, 4 en PC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Beneficio Neto" 
          value={formatMoney(stats.netProfit)} 
          icon={DollarSign} 
          colorClass={stats.netProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} 
        />
        <StatCard 
          title="Ingresos del Mes" 
          value={formatMoney(stats.monthlyIncome)} 
          icon={TrendingUp} 
          colorClass="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="Gastos del Mes" 
          value={formatMoney(stats.monthlyExpenses)} 
          icon={TrendingDown} 
          colorClass="bg-red-50 text-red-600" 
        />
        <StatCard 
          title="Dinero en Juego" 
          value={formatMoney(stats.moneyAtStake)} 
          subtitle="En tareas pendientes" 
          icon={Clock} 
          colorClass="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Cabecera de Operaciones */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Rendimiento Operativo</h2>
      </motion.div>

      {/* Grid de Operaciones (3 columnas en PC) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Clientes Activos" 
          value={stats.activeClients.toString()} 
          subtitle={`De ${stats.totalClients} totales`} 
          icon={Users} 
          colorClass="bg-primary-50 text-primary-600"
        />
        <StatCard 
          title="Tareas Pendientes" 
          value={stats.pendingTasks.toString()} 
          icon={Clock} 
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard 
          title="Completadas (Mes)" 
          value={stats.completedTasks.toString()} 
          icon={CheckCircle} 
          colorClass="bg-green-50 text-green-600"
        />
      </div>

    </motion.div>
  );
};