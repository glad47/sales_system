import React from 'react';
import './SummaryTable.scss'; // Updated import

export default function SummaryTable({ subtotal = 0.0, tax = 0.0, total = 0.0, isGen, readOnlyState }) {
  return (
    <div className="summary-table-wrapper" dir="rtl">
    <table className="summary-table" style={{width: isGen || readOnlyState ? '30%' : '33.5%'}}>
        <tbody>
        <tr>
            <td className="value-cell">{subtotal}</td>
            <td className="label-cell">الإجمالي بدون ضريبة</td>
        </tr>
        <tr>
            <td className="value-cell">{tax}</td>
            <td className="label-cell">الضريبة</td>
        </tr>
        <tr>
            <td className="value-cell">{total}</td>
            <td className="label-cell">الإجمالي</td>
        </tr>
        </tbody>
    </table>
    </div>

  );
}
