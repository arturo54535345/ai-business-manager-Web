import { useState, useEffect } from 'react';
import { motion} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { User, Bot, Target, Save, Mail, Shield, CheckCircle2, Briefcase, Building, Crown, UserCircle } from 'lucide-react';
import Alert from '../components/common/Alert';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function Settings() {
  const { user, updatePreferences, isLoading, error } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');

  // Estados locales para el formulario
  const [aiTone, setAiTone] = useState<'motivational' | 'analitycal' | 'strategic'>('strategic');
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  
  // 👈 NUEVO: Estado para saber el rol del usuario
  const [userRole, setUserRole] = useState<'worker' | 'freelancer' | 'company' | 'god_mode'>('god_mode');

  // Cuando carga la página, rellenamos el formulario con los datos reales
  useEffect(() => {
    if (user?.preferences) {
      setAiTone(user.preferences.aiTone || 'strategic');
      setMonthlyGoal(user.preferences.monthlyGoal || 5000);
      // Leemos el rol. Si no tiene, por defecto le damos el "Modo Dios" para que vea todo
      setUserRole((user.preferences as any).role || 'god_mode'); 
    }
  }, [user]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      // 👈 NUEVO: Enviamos el rol (userRole) junto con el resto de cosas.
      // Usamos "as any" por si TypeScript no conoce todavía la palabra "role", así no da error.
      await updatePreferences({ aiTone, monthlyGoal, role: userRole } as any);
      setSuccessMsg('Ajustes guardados correctamente. Tu entorno se adaptará ahora.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* CABECERA ESTILO NOTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Ajustes del Espacio</h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">Configura tu perfil, cómo funciona la IA y tu modelo de negocio.</p>
        </div>
        
        <button 
          onClick={handleSavePreferences} 
          disabled={isLoading}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center"
        >
          {isLoading ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
        </button>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600" />
          <p className="text-sm font-medium">{successMsg}</p>
        </motion.div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Tarjeta de Identificación (Ocupa 4 columnas de 12) */}
        <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-50 rounded-full mix-blend-multiply blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center pt-4">
              <div className="w-24 h-24 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white mb-4">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
              <div className="inline-flex items-center mt-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-600">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Cuenta Administrador
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 space-y-4">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-neutral-400" />
                <span className="text-neutral-700 font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-3 text-neutral-400" />
                <span className="text-neutral-700 font-medium">{user?.email}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUMNA DERECHA: Configuraciones Editables (Ocupa 8 columnas de 12) */}
        <motion.div variants={itemVariants} className="md:col-span-8 space-y-6">
          <form onSubmit={handleSavePreferences} className="space-y-6">
            
            {/* 👈 NUEVO: BLOQUE DE PERFIL FINANCIERO */}
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center tracking-tight">
                <Briefcase className="w-5 h-5 mr-2 text-neutral-400" /> Perfil Operativo y Financiero
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-3">
                    ¿Cómo operas profesionalmente? <span className="font-light text-neutral-500 ml-1">(Esto adaptará el módulo de finanzas)</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'worker', title: 'Trabajador / Empleado', desc: 'Controla tu nómina, gastos personales e ingresos fijos.', icon: UserCircle },
                      { id: 'freelancer', title: 'Autónomo', desc: 'Gestiona cuotas, IRPF, IVA, materiales y facturas.', icon: Briefcase },
                      { id: 'company', title: 'Empresa', desc: 'Pago a trabajadores, proveedores, impuestos corporativos.', icon: Building },
                      { id: 'god_mode', title: 'Modo Dios (Ver Todo)', desc: 'Desbloquea todas las categorías financieras a la vez.', icon: Crown }
                    ].map((role) => (
                      <div 
                        key={role.id}
                        onClick={() => setUserRole(role.id as any)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 group ${
                          userRole === role.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        <role.icon className={`w-5 h-5 mt-0.5 ${userRole === role.id ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                        <div>
                          <p className={`text-sm font-bold mb-0.5 ${userRole === role.id ? 'text-neutral-900' : 'text-neutral-700'}`}>{role.title}</p>
                          <p className="text-xs text-neutral-500 leading-relaxed">{role.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100">
                  <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-emerald-600" /> Meta de Facturación Mensual
                  </h3>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">€</span>
                    <input 
                      type="number" min="0" step="100"
                      value={monthlyGoal} 
                      onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 font-light">Se utilizará para calcular tu progreso en el panel de control.</p>
                </div>
              </div>
            </div>

            {/* BLOQUE DE INTELIGENCIA ARTIFICIAL */}
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center tracking-tight">
                <Bot className="w-5 h-5 mr-2 text-primary-600" /> Personalidad del Socio IA
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Tono de respuesta del Asistente Virtual</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'strategic', label: 'Estratégico', desc: 'Directo, conciso y enfocado puramente a resultados.' },
                    { id: 'analitycal', label: 'Analítico', desc: 'Basado en datos, estadísticas y números puros.' },
                    { id: 'motivational', label: 'Motivacional', desc: 'Inspirador, entusiasta y de gran apoyo emocional.' }
                  ].map((tone) => (
                    <div 
                      key={tone.id}
                      onClick={() => setAiTone(tone.id as any)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        aiTone === tone.id ? 'border-primary-600 bg-primary-50/50' : 'border-neutral-100 hover:border-neutral-300'
                      }`}
                    >
                      <p className={`text-sm font-bold mb-1 ${aiTone === tone.id ? 'text-primary-700' : 'text-neutral-600'}`}>{tone.label}</p>
                      <p className="text-xs text-neutral-500">{tone.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </form>
        </motion.div>

      </motion.div>
    </div>
  );
}