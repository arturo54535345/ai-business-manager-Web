import { useState, useEffect } from 'react';
import { motion} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { User, Bot, Target, Save, Mail, Shield, CheckCircle2 } from 'lucide-react';
import Alert from '../components/common/Alert';

const fadeUp: Variants ={
    hidden: {opacity: 0, y: 10},
    visible: {opacity: 1, y:0, transition: {duration: 0.4, staggerChildren: 0.1}}
};

const itemsVariants : Variants = {
    hidden: {opacity: 0, y: 10},
    visible: {opacity: 1, y: 0},
};

export default function Settings(){
    const {user, updatePreferences, isLoading, error} = useAuthStore();
    const [successMsg, setSuccessMsg] = useState('');

    const [aiTone, setAiTone] = useState<'motivational' | 'analitycal' | 'strategic'>('strategic');
    const [monthlyGoal, setMonthlyGoal] = useState<number>(0);

    useEffect(()=>{
        if(user?.preferences){
            setAiTone(user.preferences.aiTone || 'strategic');
            setMonthlyGoal(user.preferences.monthlyGoal || 5000);
        }
    },[user]);

    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        try{
            await updatePreferences({aiTone, monthlyGoal});
            setSuccessMsg('Preferencias actualizadas correctamente');
            setTimeout(()=> setSuccessMsg(''),3000);
        }catch(error){
            console.error(error);
        }
    };
        return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Ajustes de Cuenta</h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">Personaliza tu experiencia y configura tu Socio IA.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600" />
          <p className="text-sm font-medium">{successMsg}</p>
        </motion.div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Tarjeta de Identificación */}
        <motion.div variants={itemsVariants} className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-neutral-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-50 rounded-full mix-blend-multiply blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center pt-4">
              <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white mb-4">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
              <div className="inline-flex items-center mt-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-600">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Plan Enterprise
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

        {/* COLUMNA DERECHA: Configuraciones Editables */}
        <motion.div variants={itemsVariants} className="md:col-span-2 space-y-6">
          <form onSubmit={handleSavePreferences} className="bg-white p-8 rounded-[2rem] border border-neutral-200/60 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-primary-600" /> Personalidad de la IA
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Tono de respuesta del Asistente</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Opciones de Tono IA como botones seleccionables */}
                  {[
                    { id: 'strategic', label: 'Estratégico', desc: 'Directo y enfocado a resultados.' },
                    { id: 'analitycal', label: 'Analítico', desc: 'Basado en datos y números puros.' },
                    { id: 'motivational', label: 'Motivacional', desc: 'Inspirador y de apoyo emocional.' }
                  ].map((tone) => (
                    <div 
                      key={tone.id}
                      onClick={() => setAiTone(tone.id as any)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        aiTone === tone.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100 hover:border-neutral-300'
                      }`}
                    >
                      <p className={`text-sm font-bold mb-1 ${aiTone === tone.id ? 'text-neutral-900' : 'text-neutral-600'}`}>{tone.label}</p>
                      <p className="text-xs text-neutral-500">{tone.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" /> Objetivos de Negocio
                </h3>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Meta de Ingresos Mensuales (€)</label>
                <div className="relative max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">€</span>
                  <input 
                    type="number" min="0" step="100"
                    value={monthlyGoal} 
                    onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2 font-light">La IA usará esta meta para avisarte si estás cerca de cumplirla o no.</p>
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  type="submit" disabled={isLoading}
                  className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center"
                >
                  {isLoading ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

      </motion.div>
    </div>
    )
}