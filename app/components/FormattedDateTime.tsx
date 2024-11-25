import { cn, formatDateTime } from '@/lib/utils'
import React from 'react'

const FormattedDateTime = ({date,className}:{
    date:string,
    className?:string,
}) => {
  return (
    <div className={cn('body-1 text-leight-200',className)}>{formatDateTime(date)}</div>
  )
}

export default FormattedDateTime