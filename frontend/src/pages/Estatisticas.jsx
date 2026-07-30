import { useEffect, useState } from "react";
import { base44 } from "@/base44";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { TrendingUp, Users, BookOpen, Church, Heart, GraduationCap, Gem } from "lucide-react";

export default function Estatisticas() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    convertidos: 0,
    cultos: 0,
    participantes: 0,
    seminarios: 0,
    estudos: 0,
    batismos: 0,
    casamentos: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const stats = await base44.db.get("Estatisticas");
      setData(stats);

      if (stats.length > 0) {
        setTotals({
          convertidos: stats.reduce((s, r) => s + (r.novos_convertidos || 0), 0),
          cultos: stats.reduce((s, r) => s + (r.cultos_realizados || 0), 0),
          participantes: stats.reduce((s, r) => s + (r.participantes_cultos || 0), 0),
          seminarios: stats.reduce((s, r) => s + (r.seminarios || 0), 0),
          estudos: stats.reduce((s, r) => s + (r.estudos_biblicos || 0), 0),
          batismos: stats.reduce((s, r) => s + (r.batismos || 0), 0),
          casamentos: stats.reduce((s, r) => s + (r.casamentos || 0), 0),
        });
      }
    }
    loadStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-bold mb-2 text-gray-800">{label}</p>
          {payload.map(p => (
            <p key={p.dataKey} style={{ color: p.stroke || p.fill }} className="text-sm font-medium">
              {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Estatísticas da Igreja</h1>

      {/* Indicadores Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MiniCard title="Convertidos" value={totals.convertidos} icon={Heart} color="text-rose-500" bg="bg-rose-50" />
        <MiniCard title="Cultos" value={totals.cultos} icon={Church} color="text-emerald-600" bg="bg-emerald-50" />
        <MiniCard title="Participantes" value={totals.participantes.toLocaleString()} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <MiniCard title="Seminários" value={totals.seminarios} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
        <MiniCard title="Estudos" value={totals.estudos} icon={BookOpen} color="text-amber-600" bg="bg-amber-50" />
        <MiniCard title="Batismos" value={totals.batismos} icon={Gem} color="text-cyan-600" bg="bg-cyan-50" />
        <MiniCard title="Casamentos" value={totals.casamentos} icon={Heart} color="text-pink-500" bg="bg-pink-50" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Novos Convertidos por Ano */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg font-bold text-gray-800">Novos Convertidos por Ano</CardTitle>
            </div>
            <CardDescription>Crescimento espiritual ao longo dos anos</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ano" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="novos_convertidos" fill="hsl(142, 60%, 25%)" name="Convertidos" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cultos e Participantes */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold text-gray-800">Cultos e Participação</CardTitle>
            </div>
            <CardDescription>Quantidade de cultos vs. participantes por ano</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ano" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="cultos_realizados" stroke="hsl(142, 60%, 25%)" strokeWidth={3} name="Cultos" dot={{ r: 5, fill: 'hsl(142, 60%, 25%)' }} />
                <Line type="monotone" dataKey="participantes_cultos" stroke="#3b82f6" strokeWidth={3} name="Participantes" dot={{ r: 5, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Seminários e Estudos */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg font-bold text-gray-800">Formação e Ensino</CardTitle>
            </div>
            <CardDescription>Seminários e estudos bíblicos realizados</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ano" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="seminarios" fill="#8b5cf6" name="Seminários" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="estudos_biblicos" fill="#d946ef" name="Estudos Bíblicos" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Batismos e Casamentos */}
        <Card className="shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-lg font-bold text-gray-800">Sacramentos</CardTitle>
            </div>
            <CardDescription>Batismos e casamentos celebrados</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ano" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="batismos" fill="#06b6d4" name="Batismos" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="casamentos" fill="#f43f5e" name="Casamentos" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniCard({ title, value, icon: Icon, color, bg }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500">{title}</p>
      </CardContent>
    </Card>
  );
}
