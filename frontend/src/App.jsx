import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

// Páginas Públicas
import Site from "./pages/Site";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Layout & Auth
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Admin
import Home from "./pages/Home";
import Membros from "./pages/Membros";
import Lideres from "./pages/Lideres";
import Conselho from "./pages/Conselho";
import Entradas from "./pages/Entradas";
import Encargos from "./pages/Encargos";
import Secretaria from "./pages/Secretaria";
import Projetos from "./pages/Projetos";
import IgrejasFilhadas from "./pages/IgrejasFilhadas";
import Filiais from "./pages/Filiais";
import Configuracoes from "./pages/Configuracoes";
import Patrimonio from "./pages/Patrimonio";
import Departamentos from "./pages/Departamentos";
import DirecaoRestrita from "./pages/DirecaoRestrita";
import Estatisticas from "./pages/Estatisticas";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1rem',color:'#666'}}>Carregando...</div>}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Site />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Admin Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Home />} />
              <Route path="/admin/membros" element={<Membros />} />
              <Route path="/admin/lideres" element={<Lideres />} />
              <Route path="/admin/conselho" element={<Conselho />} />
              <Route path="/admin/secretaria" element={<Secretaria />} />
              <Route path="/admin/entradas" element={<Entradas />} />
              <Route path="/admin/encargos" element={<Encargos />} />
              <Route path="/admin/projetos" element={<Projetos />} />
              <Route path="/admin/igrejas" element={<IgrejasFilhadas />} />
              <Route path="/admin/filiais" element={<Filiais />} />
              <Route path="/admin/configuracoes" element={<Configuracoes />} />
              <Route path="/admin/patrimonio" element={<Patrimonio />} />
              <Route path="/admin/departamentos" element={<Departamentos />} />
              <Route path="/admin/direcao-restrita" element={<DirecaoRestrita />} />
              <Route path="/admin/estatisticas" element={<Estatisticas />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:16}}>
              <h1 style={{fontSize:'4rem',fontWeight:900,color:'#111'}}>404</h1>
              <p style={{color:'#666'}}>Página não encontrada</p>
              <a href="/" style={{color:'hsl(69,44%,22%)',fontWeight:600}}>Voltar ao início</a>
            </div>
          } />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
