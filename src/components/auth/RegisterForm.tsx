import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Alert from '../common/Alert';
import { motion} from 'framer-motion';
import type { Variants } from 'framer-motion';


// 1. LAS MISMAS LEYES DE LA FÍSICA QUE EN EL LOGIN
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden relative">
      
      {/* Mismo fondo animado premium */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Escenario Principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 w-full max-w-md relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Crea tu cuenta</h1>
          <p className="text-gray-500 font-medium">Únete a AI Business Manager</p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert type="error" message={error} />
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <motion.div variants={itemVariants}>
            <label className="label text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field bg-white/50 focus:bg-white transition-all duration-300"
              required
              placeholder="Ej. Ana García"
            />
          </motion.div>

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
            <label className="label text-gray-700">Contraseña segura</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field bg-white/50 focus:bg-white transition-all duration-300"
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
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
                  <span>Creando espacio...</span>
                </span>
              ) : (
                <span>Comenzar ahora</span>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="text-center text-sm text-gray-500 mt-8">
          ¿Ya formas parte del equipo?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
            Inicia sesión aquí
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}