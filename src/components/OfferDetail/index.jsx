import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin, message, Button } from 'antd';
import api from '../../api/axios'
import QuotationOfferForm from '../QuotationOfferForm';

export default function OfferDetail() {
  const { id } = useParams();
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();


  const isEdit = new URLSearchParams(location.search).get('edit') === 'true';


  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchBill = async () => {
      try {
        const res = await api.get(`/service/get_offer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          const originalItems = res.data.data.offerItems || [];
          const paddedItems = [...originalItems];

          while (paddedItems.length < 6) {
            paddedItems.push({
              description: '',
              salePrice: '',
              quantity: 0,
            });
          }

          setOfferData({ ...res.data.data, offerItems: paddedItems });
        } else {
          message.error(res.data.message || 'فشل في جلب تفاصيل العرض');
        }
      } catch (err) {
        message.error('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, navigate]);

  if (loading) return <Spin tip="جاري تحميل تفاصيل العرض..." />;

  return (
    <div style={{ padding: '0 24px' }}>
      
      <QuotationOfferForm initialData={offerData} readOnly={!isEdit} isEdit={isEdit} />
    </div>
  );
}
