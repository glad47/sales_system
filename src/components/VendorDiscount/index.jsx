import React, { useEffect, useState } from 'react';
import { InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';
import './VendorDiscount.scss';

const VendorDiscount = ({
  initialDate,
  initialDiscount = 0,
  onChangeVendorDiscount,
  disabled = false,
  label = null
}) => {
  const [date, setDate] = useState(() => dayjs());
  const [discount, setDiscount] = useState(initialDiscount);

  // Sync internal state with props when they change
  useEffect(() => {
    if (initialDate) {
      const parsed = dayjs(initialDate);
      if (parsed.isValid()) setDate(parsed);
    }
  }, [initialDate]);

  useEffect(() => {
    setDiscount(initialDiscount);
  }, [initialDiscount]);

  // Notify parent only on user interaction
  const handleDateChange = (newDate) => {
    if (newDate && dayjs(newDate).isValid()) {
      setDate(newDate);
      onChangeVendorDiscount(newDate, discount);
    }
  };

  const handleDiscountChange = (value) => {
    const safeValue = parseFloat(value) || 0;
    setDiscount(safeValue);
    onChangeVendorDiscount(date, safeValue);
  };

  

  return (
    <div className="vendor-discount-row">
      <div className="vendor-discount-table" style={{ marginBottom: 0, direction: 'ltr' }}>
        <table className="main-table_dicount" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="blue" colSpan={4} style={{ fontSize: '1.1em' }}>خصم المورد</th>
              <th className="blue" colSpan={2} style={{ fontSize: '1.1em' }}>{label ? label : "التاريخ"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="blue" colSpan={4}>
                <InputNumber
                  id="discount"
                  min={0}
                  step={0.01}
                  value={discount}
                  onChange={handleDiscountChange}
                  disabled={disabled}
                />
              </td>
              <td className="blue" colSpan={2}>
                <DatePicker
                  value={date}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                  disabled={disabled}
                  className="custom-picker"
                  style={{
                    width: '100%',
                    backgroundColor: '#e6f7ff',
                    border: 'none',
                    textAlign: 'center'
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="vendor-discount-title">قسم المشتريات</div>
    </div>
  );
};

export default VendorDiscount;
