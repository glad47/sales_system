// src/pages/MainPage.js
// src/pages/MainPage.js
import React, { useEffect, useState } from 'react';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme, Typography, message, Table, Button, Statistic, Row, Col, Modal, Popconfirm} from 'antd';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Logo from './Logo';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

const items = [VideoCameraOutlined].map(
  (icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: `كيو`,
  })
);

function MainPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [dataSource, setDataSource] = useState([]);
  const [stats, setStats] = useState({ votes: 0, usedCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);


  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'حساب تيك توك',
      dataIndex: 'tiktok',
      key: 'tiktok',
    },
  ];


  useEffect(() => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) {
        messageApi.open({
            type: 'error',
            content: 'يرجى اعادة تسجيل الدخول مرة اخرى',
            duration: 3,
        });
      navigate('/');
    }
    fetchResults();
    fetchVotingStats();
    
  }, [navigate]);
  

           
              


  const fetchResults = async () => {
    const token = localStorage.getItem('adminToken');
      if (!token) {
        messageApi.open({
            type: 'error',
            content: 'يرجى اعادة تسجيل الدخول مرة اخرى',
            duration: 3,
        });
        navigate('/');
      }
      const res = await fetch('/service/results', {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) {
        console.log("res")
          messageApi.open({
            type: 'error',
            content: 'يرجى اعادة المحاولة مرة اخرى',
            duration: 3,
        });
      }

      if(res.status == 401){
          localStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminToken');

            messageApi.open({
              type: 'error',
              content: 'يرجى اعادة تسجيل الدخول مرة اخرى',
              duration: 3,
            });

            navigate('/');
      }

        

      const result = await res.json();
      if (result) {
   
        const rawData = result;
        const filtered = Object.entries(rawData)
          .filter(([key, value]) => value.phone && value.tiktok)
          .map(([key, value], index) => ({
            key: index,
            name: value.name,
            phone: value.phone,
            tiktok: value.tiktok,
          }));

        setDataSource(filtered);
      }



  }

  const fetchVotingStats = async () => {

    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) {
      messageApi.open({
        type: 'error',
        content: 'يرجى اعادة تسجيل الدخول مرة اخرى',
        duration: 3,
      });
      navigate('/');
    }
  try {
    const res = await fetch('/service/voting-stats', {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
      });
      console.log(res)
    
      if (!res.ok) throw new Error('Failed to fetch stats');
      const result = await res.json();
      setStats({
        votes: result.votes || 0,
        usedCount: result.pending || 0,
      });
    } catch (err) {
      console.error(err);
      messageApi.open({
        type: 'error',
        content: 'تعذر تحميل الإحصائيات',
        duration: 3,
      });
    } finally {
      setLoadingStats(false);
    }
};


const showWinnerModal = (winner) => {
  Modal.success({
      content: (
          <div dir="rtl">
            <p>🎉 الفائز هو:</p>
            <p>الاسم: {winner.name}</p>
            <p>رقم الهاتف: {winner.phone}</p>
            <p>تيك توك: {winner.tiktok}</p>
          </div>
        )

      });
    };


const handleResetCompetition = async () => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) {
      messageApi.open({
        type: 'error',
        content: 'يرجى اعادة تسجيل الدخول مرة اخرى',
        duration: 3,
      });
      navigate('/');
    }

  try {
    const res = await fetch('/service/reset-competition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to reset');
    messageApi.open({
            type: 'success',
            content: 'تم إعادة تعيين المسابقة بنجاح',
            duration: 3,
    });
    fetchResults();
    fetchVotingStats();
  } catch (err) {
    messageApi.error('حدث خطأ أثناء إعادة التعيين');
  }
};

const handlePickWinner = async () => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) {
      messageApi.open({
        type: 'error',
        content: 'يرجى اعادة تسجيل الدخول مرة اخرى',
        duration: 3,
      });
      navigate('/');
    }
  try {
    const res = await fetch('/service/pick-winner', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to pick winner');
    const winner = await res.json();
    // console.log(winner)
    showWinnerModal(winner);
  } catch (err) {
    messageApi.open({
            type: 'error',
            content: 'تعذر اختيار الفائز',
            duration: 3,
    });
  }
};



  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataSource);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, 'vote-results.xlsx');
  };


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <>
    {contextHolder}
    <Layout style={{ minHeight: '100vh', direction: 'rtl' }}>
        
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => console.log(broken)}
        onCollapse={(collapsed, type) => console.log(collapsed, type)}
        style={{ background: '#001529' }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
        />
      </Sider>

      <Layout>
        <Logo />
        <Content style={{ margin: '24px 16px 0' }}>
         <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col>
                <Popconfirm
                  title="هل أنت متأكد؟"
                  description="سيتم حذف جميع البيانات وإعادة تعيين المسابقة"
                  onConfirm={() => {handleResetCompetition()}}
                  okText="نعم"
                  cancelText="لا"
                >
                  <Button danger type="primary">إعادة تعيين المسابقة</Button>
                </Popconfirm>
              </Col>
              <Col>
                <Button style={{
                  backgroundColor: '#52c41a', // Ant Design's success green
                  color: 'white',
                  borderColor: '#52c41a',
                  }} color="pink" onClick={() => {handlePickWinner()}}>اختيار فائز عشوائي</Button>
              </Col>
            </Row>

            <Title level={3}>نتائج التصويت</Title>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Statistic title="عدد المصوتين" value={stats.votes} loading={loadingStats} />
              </Col>
              <Col span={12}>
                <Statistic title="عدد المستخدمين الذين على وشك التصويت" value={stats.usedCount} loading={loadingStats} />
              </Col>
            </Row>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              style={{ marginBottom: 16 }}
              onClick={() => {exportToExcel()}}
            >
              تصدير إلى Excel
            </Button>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={{ pageSize: 10 }}
              bordered
            />
          </div>

        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ©{new Date().getFullYear()} تم الإنشاء بواسطة كيو | Gladdema
        </Footer>

      </Layout>
    </Layout>
    </>
    
  );
}

export default MainPage;

