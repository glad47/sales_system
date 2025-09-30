import React, { useEffect } from 'react';
import { Form, Input } from 'antd';
import './CompanyName.scss';

const CompanyName = ({ initialValue = '', onCompanyNameChange, disabled = false }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ companyName: initialValue });
  }, [initialValue, form]);

  return (
    <Form form={form} layout="horizontal">
      <Form.Item
        label="اسم الشركة"
        name="companyName"
        className="company-name-input"
        rules={[{message: 'يرجى إدخال اسم الشركة' }]}
      >
        <Input
          disabled={disabled}
          onChange={(e) => {
            if (!disabled) {
              onCompanyNameChange(e.target.value);
            }
          }}
        />
      </Form.Item>
    </Form>
  );
};

export default CompanyName;
