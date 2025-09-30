import { Card, Form, Input, Button, message, Space, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api/axios'

export default function UserDetail() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    api.get(`/service/get_user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const normalizedData = {
        ...res.data,
        type: Number(res.data.type)
      };
      console.log(normalizedData);

      form.setFieldsValue(normalizedData);
      setLoading(false);
    })
    .catch(() => {
      message.error('فشل في تحميل بيانات المستخدم');
      setLoading(false);
    });
  }, [id, navigate, token]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/service/update_user/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('تم تحديث المستخدم بنجاح');
      navigate('/users');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 959) {
        message.error(msg || 'المستخدم غير موجود');
      } else if (status === 960) {
        message.error(msg || 'اسم المستخدم موجود بالفعل');
      } else {
        message.error(msg || 'فشل في تحديث المستخدم');
      }
    }
  };

  const handleDiscard = () => {
    navigate('/users');
  };

  return (
    <Card style={{ marginTop: 40 }} title={`تعديل المستخدم - ${id}`} loading={loading}>
      <Form form={form} layout="vertical" autoComplete="off">
        {/* Optional dummy fields to suppress autofill */}
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />

        <Form.Item name="username" label="اسم المستخدم" rules={[{ required: true }]}>
          <Input autoComplete="off" />
        </Form.Item>

        <Form.Item name="password" label="كلمة المرور" rules={[{ required: true }]}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <Form.Item name="type" label="نوع المستخدم" rules={[{ required: true }]}>
        <Select
            placeholder="اختر دور المستخدم"
            disabled={id === '1120'} // disable if user ID is 1120
            >
            <Select.Option value={0}>مدير المشتريات</Select.Option>
            <Select.Option value={1}>مدير الطلبات</Select.Option>
            <Select.Option value={2}>مدير العروض</Select.Option>
            <Select.Option value={3}>مدير العروض والطلبات</Select.Option>

        </Select>

        </Form.Item>


        <Space>
          <Button style={{ backgroundColor: '#76c4cc', borderColor: '#76c4cc' }} type="primary" onClick={handleUpdate}>تحديث</Button>
          <Button onClick={handleDiscard}>إلغاء</Button>
        </Space>
      </Form>
    </Card>
  );
}
