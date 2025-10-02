import { Table, Button, Popconfirm, message, Form, Input, DatePicker, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'
import dayjs from 'dayjs';
import { fetchUserType } from '../../utils/userUtil';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const [searchForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchType = async () => {
        const type = await fetchUserType(); // assumes this returns a string or number
        setUserType(type);
    };
    fetchType();
    }, []);


  const fetchBills = async (params = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    setLoading(true);
    try {
      const res = await api.get('/service/search-quotations', {
        params: {
          page: params.page || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
          ...params.filters
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBills(res.data.data.map(bill => ({ ...bill, key: bill.bill_id })));
        setPagination({
          current: res.data.current,
          pageSize: res.data.pageSize,
          total: res.data.total
        });
      } else {
        message.warning(res.data.message);
      }
    } catch {
      message.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const filters = {
      username: values.username || undefined,
      companyName: values.companyName || undefined,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined
    };
    fetchBills({ page: 1, pageSize: pagination.pageSize, filters });
  };

  const handleTableChange = (pag) => {
    const values = searchForm.getFieldsValue();
    const filters = {
      username: values.username || undefined,
      companyName: values.companyName || undefined,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined
    };
    fetchBills({ page: pag.current, pageSize: pag.pageSize, filters });
  };

  const handleDelete = async (key) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    try {
      const res = await api.delete(`/service/delete_quotation/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        message.success('تم حذف طلب الشراء بنجاح');
        fetchBills();
      } else {
        message.error(res.data.message || 'فشل في حذف طلب الشراء');
      }
    } catch {
      message.error('حدث خطأ أثناء حذف طلب الشراء');
    }
  };

  const columns = [
  { title: 'اسم الشركة', width: '25%', dataIndex: 'companyName' },
  { title: 'اسم المستخدم', dataIndex: 'username' },
  {
    title: 'التاريخ والوقت',
    dataIndex: 'timestamp',
    render: ts => new Date(ts).toLocaleString('en-GB')
  },
  {
    title: 'الإجمالي',
    dataIndex: 'total',
    render: total => `${total.toFixed(2)} ريال سعودي`
  },
  {
    title: 'الإجراءات',
    render: (_, record) => (
      <>
        <Button
          onClick={() => navigate(`/bills/${record.key}?edit=true`, { state: { record } })}
          disabled={userType !== 'root'}
        >
          تعديل
        </Button>
        <Button type="link" onClick={() => navigate(`/bills/${record.key}`, { state: { record } })}>عرض</Button>
        <Popconfirm
          title="هل أنت متأكد من الحذف؟"
          onConfirm={() => handleDelete(record.key)}
          disabled={userType !== 'root'}
        >
          <Button danger disabled={userType !== 'root'}>حذف</Button>
        </Popconfirm>
      </>
    ),
  }
];


  return (
    <>
     <Form
        form={searchForm}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 24, marginTop: 36, direction: 'rtl' }}
      >
        <Form.Item name="username" label="اسم المستخدم">
          <Input
            disabled={userType !== 'root'}
            placeholder="ابحث باسم المستخدم"
          />
        </Form.Item>

        <Form.Item name="companyName" label="اسم الشركة">
          <Input placeholder="ابحث باسم الشركة" />
        </Form.Item>

        <Form.Item name="date" label="التاريخ">
          <DatePicker format="YYYY-MM-DD" placeholder="اختر التاريخ" />
        </Form.Item>

        <Form.Item>
          <Button style={{ backgroundColor: '#76c4cc', borderColor: '#76c4cc' }} type="primary" htmlType="submit">بحث</Button>
        </Form.Item>

        <Form.Item>
          <Button
            onClick={() => {
              searchForm.resetFields();
              fetchBills({ page: 1, pageSize: pagination.pageSize });
            }}
          >
            اعادة تعين
          </Button>
        </Form.Item>
      </Form>



      <Table
        dataSource={bills}
        columns={columns}
        rowKey="key"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50']
        }}
        loading={loading}
        onChange={handleTableChange}
        // style={{ marginTop: 16 }}
      />
    </>
  );
}
