import React, { useEffect, useState, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  InputNumber,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'
import SummaryTable from '../SummaryTable';
import CompanyName from '../CompanyName';
import VendorDiscount from '../VendorDiscount';
import { fetchUserType, fetchUserName } from '../../utils/userUtil'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { v4 as uuid } from 'uuid';


import './QuotationOfferForm.scss';
import HeaderForm from '../HeaderForm';

export default function QuotationOfferForm({ initialData = null, readOnly = false, isEdit }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);
  const [date, setDate] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [readOnlyState, setReadOnlyState] = useState(readOnly);
  const [userType, setUserType] = useState(null)
  const [editState, setEditState] = useState(isEdit);
  const [offerId, setOfferId] = useState(null)
  const [note, setNote] = useState('');
  const [username, setUsername] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = useRef();
  






  useEffect(() => {
    if (initialData) {
      const paddedItems = [...initialData.offerItems];
      while (paddedItems.length < 10) {
        paddedItems.push({
          description: '',
          quantity: 0,
          salePrice: 0
        });
      }

      form.setFieldsValue({ items: paddedItems });
      setDataSource(paddedItems.map((item, i) => ({ key: uuid(), ...item })));
      setCount(paddedItems.length);
      setNote(initialData.note)
      setUsername(initialData.username)
    

      setDate(initialData.vendorDate);
       


      setDiscount(initialData.vendorDiscount);
    } else {
      const initialRows = Array.from({ length: 10 }, (_, i) => ({ key: i }));
      setDataSource(initialRows);
      setCount(10);
    }
  }, [initialData]);




  useEffect(() => {
    const fetchData = async () => {
      const userType = await fetchUserType()
      setUserType(userType)
    }

    if(!userType){
       fetchData();
    }
  }, [userType])

  const onChangeVendorDiscount = (date, discount) => {
    setDate(date);
    setDiscount(discount);
  };


  useEffect(() => {
  const loadUsername = async () => {
    const name = await fetchUserName();
    if (name) setUsername(name);
  };

  if(!initialData){
    loadUsername();
  }
  
}, []);




  const normalizeItems = () => {
    const values = form.getFieldsValue();
    return (values.items || [])
      .map(item => {
        item = item || {};
        return {
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 0,
          salePrice: item.salePrice || ''
        };
      })
      .filter(item =>
        String(item.salePrice).trim() !== '' &&
        item.description.trim() !== ''
      );

    };

  const generatePDF = async (ref) => {
    setIsGeneratingPDF(true);

    await new Promise(resolve => setTimeout(resolve, 100)); // allow DOM to update
    const element = ref.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
   
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    if (imgHeight < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    } else {
      // Handle multi-page content
      while (position < imgHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        position += pageHeight;
        if (position < imgHeight) pdf.addPage();
      }
    }





    pdf.save('quotation.pdf');
    setIsGeneratingPDF(false);
};  

  const handleUpdate = async () => {
    if(!userType){
      message.error('حدث خطأ أثناء حفظ التعديلات');
      return;
    }
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');


    // Normalize and filter invoice items
    const items = normalizeItems();
    const hasValidItem = items.length > 0;

  

    if (!hasValidItem) {
      message.error('يجب إدخال بند واحد على الأقل في الفاتورة');
      return;
    }

 

    const updateData = {
      note,
      vendorDiscount: discount,
      vendorDate: date ? date.format?.('YYYY-MM-DD') || date : null,
      offerItems: normalizeItems(),
    };

    try {
      const res = await api.put(`/service/update-offer/${offerId ? offerId : initialData.offer_id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status == 200) {
        message.success('تم حفظ التعديلات بنجاح');
        if (userType !== 'root') setReadOnlyState(true);
      } else {
        message.error(res.data.message || 'فشل في حفظ التعديلات');
      }
    } catch {
      message.error('حدث خطأ أثناء حفظ التعديلات');
    }
  };

  const handleSubmission = async () => {
     if(!userType){
      message.error('حدث خطأ أثناء حفظ التعديلات');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');

    // Normalize and filter invoice items
    const items = normalizeItems();
    const hasValidItem = items.length > 0;


    if (!hasValidItem) {
      message.error('يجب إدخال بند واحد على الأقل في الفاتورة');
      return;
    }


    const submissionData = {
      note,
      vendorDiscount: discount,
      vendorDate: date ? date.format?.('YYYY-MM-DD') || date : null,
      offerItems: normalizeItems(),
    };

    try {
      const res = await api.post('/service/submit-offer', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status == 200) {
        message.success('تم إرسال عرض السعر بنجاح');
        const fullKey = res.data.key; // e.g. "quotation:1120:1759046111810"
        const parts = fullKey.split(':');
        const offerId = parts[2];
        setOfferId(offerId)
        if (userType !== 'root'){
          setReadOnlyState(true);
        }else{
          setEditState(true)
        } 
      } else {
        message.error(res.data.message || 'فشل في إرسال عرض السعر');
      }
    } catch (error) {
      message.error('حدث خطأ أثناء إرسال عرض السعر');
    }
  };

  const columns = [
    { title: '#', width: '3.5%', dataIndex: 'index', render: (_, __, i) => i + 1 },
    {
      title: 'البيان',
      dataIndex: 'description',
      width: '35%',
      render: (_, __, index) => (
        <Form.Item name={['items', index, 'description']} noStyle>
          <Input disabled={readOnlyState} />
        </Form.Item>
      )
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      render: (_, __, index) => (
        <Form.Item name={['items', index, 'quantity']} noStyle>
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            disabled={readOnlyState}
          />
        </Form.Item>
      )
    },
    {
      title: 'سعر البيع',
      dataIndex: 'salePrice',
      render: (_, __, index) => (
        <Form.Item name={['items', index, 'salePrice']} noStyle>
          <Input style={{ width: '100%' }} disabled={readOnlyState} />
        </Form.Item>
      )
    },
    !isGeneratingPDF && !readOnlyState && {
      title: '',
      dataIndex: 'actions',
      width: '5%',
      render: (_, __, index) => (
                <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => {
            const newData = [...dataSource];
            newData.splice(index, 1);
            setDataSource(newData);
          }}
        />
      )
    }
  ].filter(Boolean);


    return (
    <div ref={pdfRef}>
    <HeaderForm header={"العروض"} />
    <div className="container">
      <Form form={form} layout="vertical" style={{ direction: 'rtl' }}>

        <VendorDiscount
          initialDate={date}
          initialDiscount={discount}
          onChangeVendorDiscount={onChangeVendorDiscount}
          disabled={readOnlyState}
          label ={"بداية تاريخ العرض"}
        />

        <Table
          className="main-table"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowKey="key"
          bordered
          tableLayout="fixed"
        />



        <div className="note-section" style={{marginTop: 15}}>
         
            <label>ملاحظة:</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="note-input"
              disabled={readOnlyState}
            />
       
          </div>

          <table className="signatures-table">
            <thead>
              <tr>
                <th>توقيع المشتريات</th>
              
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Input key={"username"} onChange={(e) =>{
                    if(!editState){
                      setUsername(e.target.value)}
                    }
                  }  value={username} disabled={readOnlyState} />
                </td>
              </tr>
            </tbody>
          </table>
        {
            (!isGeneratingPDF  && readOnlyState && <Form.Item style={{ marginTop: 24 }}>
              {    <Button  type="primary" onClick={() => generatePDF(pdfRef)}>تحميل PDF</Button>}


              
            </Form.Item>)
        }  

        {!isGeneratingPDF && !readOnlyState && (
          <>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setDataSource([...dataSource, { key: count }]);
                setCount(count + 1);
              }}
              block
              style={{
                marginTop: 16,
                borderColor: '#76c4cc',
                color: '#76c4cc',
                backgroundColor: '#f0fbfc',
                fontWeight: 'bold',
                borderRadius: 6
              }}
            >
              إضافة بند
            </Button>

            <Form.Item style={{ marginTop: 24 }}>
              <Button style={{ backgroundColor: '#76c4cc', borderColor: '#76c4cc' }} type="primary" onClick={editState ? handleUpdate : handleSubmission}>
                {editState ? 'حفظ' : 'ارسال'}
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </div>
    </div>
    
  );
}


