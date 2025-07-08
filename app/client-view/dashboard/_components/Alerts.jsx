import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, LogOut, AlertTriangle } from "lucide-react";

const alertVariants = {
  checkIn: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    title: "Visitor Checked In",
    color: "border-green-500 bg-green-50",
  },
  checkOut: {
    icon: <LogOut className="h-5 w-5 text-blue-500" />,
    title: "Visitor Checked Out",
    color: "border-blue-500 bg-blue-50",
  },
  newVisitor: {
    icon: <Info className="h-5 w-5 text-yellow-500" />,
    title: "New Visitor Added",
    color: "border-yellow-500 bg-yellow-50",
  },
  timeout: {
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
    title: "Visitor Overstayed",
    color: "border-red-600 bg-red-50",
  },
};

export default function Alerts({ type = "newVisitor", message }) {
    
  const alert = alertVariants[type] || alertVariants.newVisitor;

  return (
    <Alert className={`flex items-start gap-3 ${alert.color}`}>
      <div className="mt-1">{alert.icon}</div>
      <div>
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
}
