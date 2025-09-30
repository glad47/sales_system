import {
  Table,
  Button,
  Popconfirm,
  message,
  Form,
  Input,
  DatePicker,
  Select, Space
} from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'
import dayjs from 'dayjs';

export default function ReceiveOffersPage() {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const navigate = useNavigate();

  const statusOptions = [
    { label: 'Processing', value: 0 },
    { label: 'Accepted', value: 1 },
    { label: 'Canceled', value: 2 }
  ];

  const fetchOffers = async (params = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    setLoading(true);
    try {
      const res = await api.get('/service/search-offers-rec', {
        params: {
          page: params.page || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
          ...params.filters
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOffers(res.data.data.map(offer => ({ ...offer, key: offer.offer_id })));
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
    fetchOffers({ page: 1, pageSize: pagination.pageSize, filters: { status: 0 } });
  }, []);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const filters = {
      username: values.username || undefined,
      status :  values.status || 0,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
    };
    fetchOffers({ page: 1, pageSize: pagination.pageSize, filters });
  };

  const handleTableChange = (pag) => {
    const values = searchForm.getFieldsValue();
    const filters = {
      username: values.username || undefined,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
      status: values.status || 0
    };
    fetchOffers({ page: pag.current, pageSize: pag.pageSize, filters });
  };

  const handleStatusChange = async (offerId, newStatus) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return navigate('/');
  try {
    const res = await api.put(`/service/update-offer-status/${offerId}`, {
      status: newStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data.success) {
      message.success('تم تحديث حالة عرض ');
      fetchOffers({ page: 1, pageSize: pagination.pageSize, filters: { status: 0 }}); // refresh list
    } else {
      message.error(res.data.message || 'فشل في تحديث الحالة');
    }
  } catch {
    message.error('حدث خطأ أثناء تحديث الحالة');
  }
};


  

  const columns = [
  { title: 'اسم المستخدم', dataIndex: 'username' },
  {
    title: 'الوقت والتاريخ',
    dataIndex: 'timestamp',
    render: ts => new Date(ts).toLocaleString('en-GB')
  },
  {
    title: 'خصم المورد',
    dataIndex: 'vendorDiscount'
  },
  {
    title: 'الإجراءات',
    render: (_, record) => (
      <Space wrap size="small">
        <Button type="link" onClick={() => navigate(`/offers/${record.key}`)}>
          عرض
        </Button>
        <Popconfirm
          title="هل أنت متأكد من قبول العرض؟"
          onConfirm={() => handleStatusChange(record.key, 1)}
        >
          <Button style={{ backgroundColor: '#76c4cc', borderColor: '#76c4cc' }} type="primary">قبول</Button>
        </Popconfirm>
        <Popconfirm
          title="هل أنت متأكد من رفض العرض؟"
          onConfirm={() => handleStatusChange(record.key, 2)}
        >
          <Button danger type="dashed">رفض</Button>
        </Popconfirm>
      </Space>
    ),
  }
];


  return (
    <>
      <Form
        form={searchForm}
        layout="inline"
        onFinish={handleSearch}
        initialValues={{ status: 0 }}
        style={{ marginBottom: 24, marginTop: 36, direction: 'rtl' }}
      >
        <Form.Item name="username" label="اسم المستخدم">
          <Input placeholder="ابحث باسم المستخدم" />
        </Form.Item>

        <Form.Item name="date" label="التاريخ">
          <DatePicker format="YYYY-MM-DD" placeholder="اختر التاريخ" />
        </Form.Item>

        <Form.Item name="status" label="الحالة">
          <Select style={{ width: 160 }} options={statusOptions} />
        </Form.Item>

        <Form.Item>
          <Button style={{ backgroundColor: '#76c4cc', borderColor: '#76c4cc' }} type="primary" htmlType="submit">بحث</Button>
        </Form.Item>

        <Form.Item>
          <Button
            onClick={() => {
              searchForm.resetFields();
              fetchOffers({ page: 1, pageSize: pagination.pageSize, filters: { status: 0 } });
            }}
          >
            اعادة تعين
          </Button>
        </Form.Item>
      </Form>


      <Table
        dataSource={offers}
        columns={columns}
        rowKey="key"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50']
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
}
