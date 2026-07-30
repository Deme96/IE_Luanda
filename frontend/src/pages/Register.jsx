import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/base44";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await base44.auth.register(email, password);
      toast.success("Conta criada! Você pode fazer login agora.");
      navigate("/login");
    } catch (e) {
      toast.error(e.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Registre-se para acessar o painel administrativo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-military hover:bg-military-dark">
              Registrar
            </Button>
            <div className="text-sm text-center">
              <Link to="/login" className="text-military hover:underline">Já tenho uma conta</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
