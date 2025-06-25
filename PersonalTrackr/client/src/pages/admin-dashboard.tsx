import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ProductWithCategory, PaymentMethod, UserRole } from "@shared/schema";
import { Users, Utensils, CreditCard, BarChart3, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: products = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products/all"],
  });
  
  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods/all"],
  });
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  if (!user) return null;

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "default";
      case UserRole.ATENDENTE:
        return "secondary";
      case UserRole.COZINHA:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrador";
      case UserRole.ATENDENTE:
        return "Atendente";
      case UserRole.COZINHA:
        return "Cozinha";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen restaurant-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gestão completa do restaurante</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Utensils className="h-4 w-4" />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input id="name" placeholder="Digite o nome completo" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Digite o email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Usuário</Label>
                          <Input id="username" placeholder="Digite o nome de usuário" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Senha</Label>
                          <Input id="password" type="password" placeholder="Digite a senha" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Perfil</Label>
                          <Select>
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
                        <Button type="submit" className="w-full">
                          Adicionar Usuário
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perfil
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.active ? "default" : "secondary"}>
                              {user.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Management */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciar Produtos</CardTitle>
                  <Button className="bg-primary hover:bg-secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-200 relative">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xl font-bold text-primary">
                            R$ {product.price}
                          </span>
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <Button className="bg-primary hover:bg-secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Método
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <Card key={method.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {method.name}
                            </h3>
                            <Badge 
                              variant={method.active ? "default" : "secondary"}
                              className="mt-2"
                            >
                              {method.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Sales */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas de Hoje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total de Pedidos</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Faturamento</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {stats?.totalRevenue?.toFixed(2) || "0,00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Ticket Médio</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {stats?.averageTicket?.toFixed(2) || "0,00"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Table Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status das Mesas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium">Mesas Livres</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats?.freeTables || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="font-medium">Mesas Ocupadas</span>
                    <span className="text-2xl font-bold text-red-600">
                      {stats?.occupiedTables || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Pratos Prontos</span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {stats?.readyOrders || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
