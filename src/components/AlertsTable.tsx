import { useState, useEffect } from "react";
import { Trash2, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PriceAlert } from "./AlertModal";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";

interface AlertsTableProps {
  alerts: PriceAlert[];
  onDeleteAlert: (alertId: string) => void;
}

export const AlertsTable = ({ alerts, onDeleteAlert }: AlertsTableProps) => {
  const { canAddAlert } = useAuth();
  const activeAlerts = alerts.filter(alert => alert.isActive);

  if (activeAlerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
        <p className="text-muted-foreground">
          Set price alerts for cryptocurrencies to get notified when they reach your target prices.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5" />
        <h3 className="text-lg font-semibold">My Alerts</h3>
        <Badge variant="secondary">{activeAlerts.length}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coin</TableHead>
            <TableHead>Alert Type</TableHead>
            <TableHead className="text-right">Target Price</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeAlerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{alert.coinName}</div>
                  <div className="text-sm text-muted-foreground uppercase">
                    {alert.coinSymbol}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={alert.alertType === "above" ? "default" : "secondary"}>
                  {alert.alertType === "above" ? "Above" : "Below"} ${alert.targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                ${alert.targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {alert.email}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {alert.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteAlert(alert.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
