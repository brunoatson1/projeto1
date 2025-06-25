import { Table, TableStatus } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Users, Bell } from "lucide-react";

interface TableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
}

export default function TableGrid({ tables, onTableSelect }: TableGridProps) {
  const getTableStatusClass = (status: TableStatus) => {
    switch (status) {
      case TableStatus.FREE:
        return "status-free";
      case TableStatus.OCCUPIED:
        return "status-occupied";
      case TableStatus.READY:
        return "status-ready";
      default:
        return "bg-gray-200 border-gray-200";
    }
  };

  const getTableIcon = (status: TableStatus) => {
    switch (status) {
      case TableStatus.FREE:
        return <Coffee className="h-6 w-6" />;
      case TableStatus.OCCUPIED:
        return <Users className="h-6 w-6" />;
      case TableStatus.READY:
        return <Bell className="h-6 w-6" />;
      default:
        return <Coffee className="h-6 w-6" />;
    }
  };

  const getTableStatusLabel = (status: TableStatus) => {
    switch (status) {
      case TableStatus.FREE:
        return "Livre";
      case TableStatus.OCCUPIED:
        return "Ocupada";
      case TableStatus.READY:
        return "Pronto!";
      default:
        return "Livre";
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`table-card cursor-pointer border-2 ${getTableStatusClass(table.status)}`}
            onClick={() => onTableSelect(table)}
          >
            <CardContent className="p-4 text-center">
              <div className="mb-2">
                {getTableIcon(table.status)}
              </div>
              <p className="font-semibold">Mesa {table.number.toString().padStart(2, '0')}</p>
              <p className="text-sm opacity-75">
                {getTableStatusLabel(table.status)}
              </p>
              {table.seats && (
                <p className="text-xs opacity-60 mt-1">
                  {table.seats} lugares
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Livre</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Ocupada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span>Prato Pronto</span>
        </div>
      </div>
    </div>
  );
}
