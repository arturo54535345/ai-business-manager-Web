import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAuthStore} from '../../stores/authStore';
import Alert from '../common/Alert';

export default function LoginForm(){
    const navigate = useNavigate();
    const {login, isLoading, error} = useAuthStore();
    const [formData, setFormData] = useState({email: '', password: ''});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            //llamo al cerebro osea el authStore para que intente abrir la puerta
            await login(formData.email,formData.password);
            //si no explota es que esta todo bien y la llave es la correcta
            navigate('/dashboard');
        }catch(err){
            console.error('Login error:', err);
        }
    };
    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">AI Business Manager</h1>
          <p className="text-gray-600">Tu socio inteligente de negocios</p>
        </div>

        {/* Si hay un error en la memoria, mostramos el cartel luminoso */}
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
    );
};