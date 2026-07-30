import { useEffect, useState } from "react";
import { base44 } from "@/base44";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, Crown, Pickaxe, Map, HandCoins, Banknote, HeartHandshake, Bell, CalendarClock } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    membros: 0,
    lideres: 0,
    projetos: 0,
    igrejas: 0,
    dizimos: 0,
    ofertas: 0,
    encargos: 0,
  });
  
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [cultos, setCultos] = useState([]);
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    async function loadStats() {
      const membros = await base44.db.get("Membro");
      const lideres = await base44.db.get("Lider");
      const projetos = await base44.db.get("Projeto");
      const igrejas = await base44.db.get("IgrejaFilhada");
      const dizimos = await base44.db.get("Dizimo");
      const ofertas = await base44.db.get("Oferta");
      const encargos = await base44.db.get("Encargo");
      
      const cultosData = await base44.db.get("Cultos");
      const noticiasData = await base44.db.get("Noticias");
      setCultos(cultosData.slice(0, 3));
      setNoticias(noticiasData.slice(0, 3));

      const totalDizimos = dizimos.reduce((acc, curr) => acc + Number(curr.valor), 0);
      const totalOfertas = ofertas.reduce((acc, curr) => acc + Number(curr.valor), 0);
      const totalEncargos = encargos.reduce((acc, curr) => acc + Number(curr.valor), 0);

      setStats({
        membros: membros.length,
        lideres: lideres.filter(l => l.status === "ativo").length,
        projetos: projetos.filter(p => p.status === "em_andamento").length,
        igrejas: igrejas.filter(i => i.status === "ativa").length,
        dizimos: totalDizimos,
        ofertas: totalOfertas,
        encargos: totalEncargos,
      });

      // Mock Data for Charts
      setChartData([
        { name: "Jan", dizimos: 4000, ofertas: 2400, encargos: 2400 },
        { name: "Fev", dizimos: 3000, ofertas: 1398, encargos: 2210 },
        { name: "Mar", dizimos: 2000, ofertas: 9800, encargos: 2290 },
        { name: "Abr", dizimos: 2780, ofertas: 3908, encargos: 2000 },
        { name: "Mai", dizimos: 1890, ofertas: 4800, encargos: 2181 },
        { name: "Jun", dizimos: 2390, ofertas: 3800, encargos: 2500 },
      ]);

      const pagos = encargos.filter(e => e.status === "pago").length || 3;
      const pendentes = encargos.filter(e => e.status === "pendente").length || 1;
      const cancelados = encargos.filter(e => e.status === "cancelado").length || 0;

      setPieData([
        { name: "Pago", value: pagos, color: "hsl(142, 60%, 25%)" }, // Verde militar
        { name: "Pendente", value: pendentes, color: "hsl(44, 78%, 52%)" }, // Dourado
        { name: "Cancelado", value: cancelados, color: "#ef4444" },
      ]);
    }
    loadStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-bold mb-2 text-gray-800">{label}</p>
          {payload.map(p => (
            <p key={p.dataKey} style={{ color: p.fill }} className="text-sm font-medium">
              {p.name}: R$ {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Visão Geral</h1>
      
      {/* Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Dízimos (Mês)" value={`R$ ${stats.dizimos.toFixed(2)}`} icon={HandCoins} color="text-emerald-600" bg="bg-emerald-100" />
        <StatCard title="Ofertas (Mês)" value={`R$ ${stats.ofertas.toFixed(2)}`} icon={HeartHandshake} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Encargos (Mês)" value={`R$ ${stats.encargos.toFixed(2)}`} icon={Banknote} color="text-rose-600" bg="bg-rose-100" />
        <StatCard title="Saldo em Caixa" value={`R$ ${(stats.dizimos + stats.ofertas - stats.encargos).toFixed(2)}`} icon={Banknote} color="text-gray-800" bg="bg-gray-100" />
      </div>

      {/* Organizacional */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Membros" value={stats.membros} icon={Users} color="text-military" bg="bg-military/10" />
        <StatCard title="Líderes Ativos" value={stats.lideres} icon={Crown} color="text-military" bg="bg-military/10" />
        <StatCard title="Projetos Ativos" value={stats.projetos} icon={Pickaxe} color="text-military" bg="bg-military/10" />
        <StatCard title="Igrejas Filiadas" value={stats.igrejas} icon={Map} color="text-military" bg="bg-military/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico de Barras Modernizado */}
        <Card className="col-span-1 md:col-span-2 shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-bold text-gray-800">Movimentação Financeira</CardTitle>
            <CardDescription>Resumo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="dizimos" fill="hsl(142, 60%, 25%)" name="Dízimos" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="ofertas" fill="hsl(142, 40%, 45%)" name="Ofertas" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="encargos" fill="#f43f5e" name="Encargos" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Donut Modernizado */}
        <Card className="col-span-1 shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-bold text-gray-800">Status de Encargos</CardTitle>
            <CardDescription>Distribuição de pagamentos</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center items-center pt-2">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-2 w-full">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs font-medium text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Eventos e Atividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Cultos */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-military text-white">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              <CardTitle className="text-lg font-bold">Próximos Cultos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {cultos.length === 0 && <li className="p-4 text-sm text-gray-500">Nenhum culto cadastrado.</li>}
              {cultos.map(culto => (
                <li key={culto.id} className="p-4 hover:bg-gray-50 flex items-start gap-4 transition-colors">
                  <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs font-bold text-gray-500 uppercase">{culto.dia.substring(0,3)}</span>
                    <span className="text-sm font-bold text-military">{culto.hora}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{culto.nome}</p>
                    <p className="text-sm text-gray-500">{culto.descricao}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Notícias / Atividades */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-military-dark text-white">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle className="text-lg font-bold">Avisos e Eventos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {noticias.length === 0 && <li className="p-4 text-sm text-gray-500">Nenhum evento próximo.</li>}
              {noticias.map(noticia => (
                <li key={noticia.id} className="p-4 hover:bg-gray-50 flex items-start gap-4 transition-colors">
                  <div className="bg-amber-100 text-amber-700 p-2 rounded-full mt-1">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{noticia.titulo}</p>
                    <p className="text-xs font-medium text-gray-400 mb-1">{noticia.data}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{noticia.descricao}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <Card className="border-none shadow-sm shadow-gray-200">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
