import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'bg-gradient-ocean',
    success: 'bg-gradient-to-br from-success to-success/80',
    warning: 'bg-gradient-alert',
    danger: 'bg-gradient-to-br from-destructive to-destructive/80',
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg transition-transform hover:scale-105">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-6">
          <div className={`rounded-xl p-3 ${variantStyles[variant]}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p
                className={`mt-1 text-xs font-medium ${
                  trend.isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% vs mois dernier
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
