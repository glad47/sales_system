import { Table, Button, Popconfirm, message, Form, Input, DatePicker, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'
import dayjs from 'dayjs';
import { fetchUserType } from '../../utils/userUtil';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchType = async () => {
        const type = await fetchUserType(); // assumes this returns a string or number
        setUserType(type);
    };
    fetchType();
    }, []);

  const fetchOffers = async (params = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    setLoading(true);
    try {
      const res = await api.get('/service/search-offers', {
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
    fetchOffers();
  }, []);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const filters = {
      username: values.username || undefined,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined
    };
    fetchOffers({ page: 1, pageSize: pagination.pageSize, filters });
  };

  const handleTableChange = (pag) => {
    const values = searchForm.getFieldsValue();
    const filters = {
      username: values.username || undefined,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined
    };
    fetchOffers({ page: pag.current, pageSize: pag.pageSize, filters });
  };

  const handleDelete = async (key) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    try {
      const res = await api.delete(`/service/delete_offer/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        message.success('تم حذف العرض بنجاح');
        fetchOffers();
      } else {
        message.error(res.data.message || 'فشل في حذف العرض');
      }
    } catch {
      message.error('حدث خطأ أثناء حذف العرض');
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
          <>
            <Button
              disabled={userType !== 'root'}
              onClick={() => navigate(`/offers/${record.key}?edit=true`)}
            >
              تعديل
            </Button>
            <Button type="link" onClick={() => navigate(`/offers/${record.key}`)}>
              عرض
            </Button>
            <Popconfirm
              title="هل أنت متأكد من الحذف؟"
              onConfirm={() => handleDelete(record.key)}
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
          <Input placeholder="ابحث باسم المستخدم" />
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
              fetchOffers({ page: 1, pageSize: pagination.pageSize }); // إعادة تحميل العروض
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
