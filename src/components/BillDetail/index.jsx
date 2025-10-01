import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin, message, Button } from 'antd';
import api from '../../api/axios'
import QuotationForm from '../QuotationForm';

export default function BillDetail() {
    const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const record = location.state?.record;
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(true);



  const isEdit = new URLSearchParams(location.search).get('edit') === 'true';


  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchBill = async () => {
      console.log(record)
      try {
        const res = await api.get(`/service/get_quotation/${record.user_id}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          const originalItems = res.data.data.billItems || [];
          const paddedItems = [...originalItems];

          while (paddedItems.length < 10) {
            paddedItems.push({
              description: '',
              intensity: '',
              cost: 0,
              quantity: 0,
              salePrice: 0,
              location: '',
              totalCost: 0
            });
          }

          setBillData({ ...res.data.data, billItems: paddedItems });
        } else {
          message.error(res.data.message || 'فشل في جلب تفاصيل عرض السعر');
        }
      } catch (err) {
        message.error('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, navigate]);

  if (loading) return <Spin tip="جاري تحميل تفاصيل الفاتورة..." />;

  return (
    <div style={{ padding: '0 24px' }}>
      
      <QuotationForm initialData={billData} readOnly={!isEdit} isEdit={isEdit} />

    </div>
  );
}
