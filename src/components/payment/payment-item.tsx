import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Payment } from "@/types/payment"
import { formatCurrency } from "@/lib/utils"

interface PaymentItemProps {
  payment: Payment
  onClick?: (payment: Payment) => void
  isSelected?: boolean
  index?: number
}

export function PaymentItem({ payment, onClick, isSelected, index }: PaymentItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick(payment)
    }
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isSelected && "border-primary"
      )}
      onClick={handleClick}
    >
      <CardContent className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          <span className="font-medium">{formatCurrency(payment.amount)}</span>
          <span className="text-sm text-gray-500">
            {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
          </span>
        </div>
        {index !== undefined && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {index}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
} 