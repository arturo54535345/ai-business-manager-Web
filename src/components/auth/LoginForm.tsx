import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Alert from '../common/Alert';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// 1. LAS LEYES DE LA FÍSICA (La Coreografía)
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1, 
      delayChildren: 0.2,   
    },
  },
};

// 👇 CORREGIDO: "itemVariants" con 's' minúscula
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden relative">
      
      {/* Círculos decorativos de fondo (Estilo Glassmorphism muy sutil) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* El Escenario Principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 w-full max-w-md relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">AI Business</h1>
          <p className="text-gray-500 font-medium">Tu socio inteligente de negocios</p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert type="error" message={error} />
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <motion.div variants={itemVariants}>
            <label className="label text-gray-700">Email corporativo</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field bg-white/50 focus:bg-white transition-all duration-300"
              required
              placeholder="tu@empresa.com"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="label text-gray-700">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field bg-white/50 focus:bg-white transition-all duration-300"
              required
              placeholder="••••••••"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verificando...</span>
                </span>
              ) : (
                <span>Acceder al Panel</span>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="text-center text-sm text-gray-500 mt-8">
          ¿No tienes acceso?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
            Solicita una cuenta
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}