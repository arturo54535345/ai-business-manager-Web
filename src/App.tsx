import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Las puertas públicas */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Un cartel temporal para cuando entremos con éxito */}
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <h1 className="text-3xl font-bold text-primary-600">
                ¡Login exitoso! Bienvenido al Dashboard (Próximamente)
              </h1>
            </div>
          }
        />

        {/* Si alguien entra a la raíz de la web, lo mandamos directo al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
