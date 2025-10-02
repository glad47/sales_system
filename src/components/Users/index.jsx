import { Table, Button, Popconfirm, message, Modal, Form, Input, Select } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get('/service/list_users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatted = res.data.map(user => ({
          ...user,
          key: user.user_id
        }));
        setUsers(formatted);
      } catch {
        message.error('فشل في تحميل المستخدمين');
      }
    };

    fetchUsers();
  }, [navigate, token]);

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/service/delete_user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(user => user.key !== userId));
      message.success('تم حذف المستخدم بنجاح');
    } catch {
      message.error('فشل في حذف المستخدم');
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const res = await api.post('/service/add_user', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => [...prev, { key: res.data.userId, ...values }]);
      message.success('تم إنشاء المستخدم بنجاح');
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 960) {
        message.error(msg || 'اسم المستخدم موجود بالفعل');
      } else {
        message.error(msg || 'فشل في إنشاء المستخدم');
      }
    }
  };

  const columns = [
  { title: 'اسم المستخدم', dataIndex: 'username' },
  {
    title: 'الدور',
    dataIndex: 'type',
    render: type => {
      const roleMap = {
        0: 'مدير المشتريات',
        1: 'مدير الطلبات',
        2: 'مدير العروض',
        3: 'مدير العروض والطلبات',
        'root': 'المسؤول',
      };
      return roleMap[type] || 'غير معروف';
    }
  },
  {
    title: 'الإجراءات',
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => navigate(`/users/${record.key}`)}>تعديل</Button>
        <Popconfirm title="هل أنت متأكد من الحذف؟" onConfirm={() => handleDelete(record.key)}>
          <Button danger>حذف</Button>
        </Popconfirm>
      </>
    ),
  },
];


  return (
    <>
      <Button
        type="primary"
        style={{ backgroundColor: '#76c4cc', borderColor: '#76c4cc', marginTop: 40  }}
        onClick={() => setIsModalOpen(true)}
      >
        إضافة مستخدم
      </Button>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="key"
        style={{ marginTop: 16 }}
      />

      <Modal
        title="إضافة مستخدم جديد"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item name="username" label="اسم المستخدم" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="كلمة المرور" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="type" label="نوع المستخدم" rules={[{ required: true }]}>
            <Select placeholder="اختر نوع المستخدم">
              <Select.Option value={0}>مدير المشتريات</Select.Option>
              <Select.Option value={1}>مدير الطلبات</Select.Option>
              <Select.Option value={2}>مدير العروض</Select.Option>
              <Select.Option value={3}>مدير العروض والطلبات</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
