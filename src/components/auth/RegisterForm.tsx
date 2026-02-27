import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Alert from '../common/Alert';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { UserPlus, ArrowRight, Mail, Lock, User } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] relative overflow-hidden px-4">
      
      {/* Fondo Premium: Cuadrícula de puntos */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      
      {/* Brillo sutil de fondo */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-neutral-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 -translate-x-1/3 -translate-y-1/3"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-neutral-200/60 w-full max-w-md relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, rotate: 10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-900 mb-6 shadow-sm border border-neutral-200"
          >
            <UserPlus className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">Crea tu cuenta</h1>
          <p className="text-neutral-500 font-medium">Únete a AI Business Manager</p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="mb-6">
            <Alert type="error" message={error} />
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5 pl-1">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text" required
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all outline-none"
                placeholder="Ej. Ana García"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5 pl-1">Email corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email" required
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all outline-none"
                placeholder="tu@empresa.com"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5 pl-1">Contraseña segura</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password" required minLength={6}
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <button
              type="submit" disabled={isLoading}
              className="w-full py-4 px-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center space-x-2 group"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creando espacio...</span>
                </span>
              ) : (
                <>
                  <span>Comenzar ahora</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="text-center text-sm text-neutral-500 mt-8 font-medium">
          ¿Ya formas parte del equipo?{' '}
          <Link to="/login" className="text-neutral-900 font-bold hover:underline decoration-2 underline-offset-4 transition-all">
            Inicia sesión aquí
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}