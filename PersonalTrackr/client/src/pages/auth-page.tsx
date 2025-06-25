import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Users, ChefHat, Shield } from "lucide-react";
import { UserRole } from "@shared/schema";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    role: UserRole.ATENDENTE,
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen restaurant-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <Utensils className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold text-gray-900">RestaurantePOS</h1>
            </div>
            <p className="text-xl text-gray-600">
              Sistema completo de gestão para restaurantes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-blue-500" />
              <h3 className="font-semibold">Atendente</h3>
              <p className="text-sm text-gray-600 text-center">
                Gerencie mesas e pedidos
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
              <ChefHat className="h-8 w-8 text-red-500" />
              <h3 className="font-semibold">Cozinha</h3>
              <p className="text-sm text-gray-600 text-center">
                Controle de pedidos e preparo
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-green-500" />
              <h3 className="font-semibold">Administrador</h3>
              <p className="text-sm text-gray-600 text-center">
                Gestão completa do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acesso ao Sistema</CardTitle>
              <CardDescription>
                Entre com suas credenciais ou registre-se
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Registrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuário</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Digite seu usuário"
                        required
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-secondary"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nome Completo</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Digite seu nome completo"
                        required
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Digite seu email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Usuário</Label>
                      <Input
                        id="reg-username"
                        type="text"
                        placeholder="Escolha um nome de usuário"
                        required
                        value={registerData.username}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Senha</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Escolha uma senha"
                        required
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-role">Perfil</Label>
                      <Select value={registerData.role} onValueChange={(value: UserRole) => setRegisterData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.ATENDENTE}>Atendente</SelectItem>
                          <SelectItem value={UserRole.COZINHA}>Cozinha</SelectItem>
                          <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-secondary"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registrando..." : "Registrar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
