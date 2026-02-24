import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Alert from '../common/Alert';

export default function RegisterForm(){
    const navigate = useNavigate();
    const {register, isLoading, error} = useAuthStore();
    const [formData, setFormData] = useState({name: '', email: '', password: ''});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            //llamo al backend para registrare al usuario nuevo
            await register(formData.email, formData.password, formData.name);
            navigate('/dashboard');
        }catch(err){
            console.error('Register error:', err);
        }
    };
    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">AI Business Manager</h1>
          <p className="text-gray-600">Crea tu cuenta y comienza a gestionar tu negocio</p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
    );
};