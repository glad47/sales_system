import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  SolutionOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, notification  } from 'antd';
import CompanyName from '../CompanyName';
import VendorDiscount from '../VendorDiscount';
import QuotationForm from '../QuotationForm'
import Footer from '../Footer';
import HeaderForm from '../HeaderForm'
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import Users from '../Users';
import UserDetail from '../UserDetail';
import Bills from '../Bills';
import BillDetail from '../BillDetail';
import { useNavigate,useLocation } from 'react-router-dom';
import { fetchUserName } from '../../utils/userUtil';
import Offers from '../Offers';
import QuotationOfferForm from '../QuotationOfferForm';
import axios from 'axios';
import OfferDetail from '../OfferDetail';
import ReceiveSalesPage from '../ReceiveSalesPage';
import ReceiveOffersPage from '../ReceiveOfferPage';
import { fetchUserType } from '../../utils/userUtil';
import ReturnBtn from '../ReturnBtn';



import "./MainPage.scss"




const { Header, Sider, Content } = Layout;

const MainPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState('');
  const [api, contextHolder] = notification.useNotification();
  const [unseenNotifications, setUnseenNotifications] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [userType, setUserType] = useState(null);
  const [menuItems, setMenuItems] = useState([]);


  const location = useLocation();
  const isDetailPage = /^\/(users|bills|offers)\/[^/]+$/.test(location.pathname);


  const allMenuItems = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link to="/users">المستخدمون</Link>,
    },
    {
      key: 'bills',
      icon: <FileTextOutlined />,
      label: <Link to="/bills">الفواتير</Link>,
    },
    {
      key: 'offers',
      icon: <FileDoneOutlined />,
      label: <Link to="/offers">العروض</Link>,
    },
    {
      key: 'quotation',
      icon: <FileAddOutlined />,
      label: <Link to="/quotation">إنشاء عرض سعر</Link>,
    },
    {
      key: 'quotation-offer',
      icon: <SolutionOutlined />,
      label: <Link to="/offer-quotation">إنشاء عرض</Link>,
    },
    {
      key: 'received-quotation',
      icon: <FileSearchOutlined />,
      label: <Link to="/received-quotation">عروض الأسعار المستلمة</Link>,
    },
    {
      key: 'received-offer',
      icon: <InboxOutlined />,
      label: <Link to="/received-offer">العروض المستلمة</Link>,
    },
  ];




  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/'); 
  };

  useEffect(() => {

  const token = localStorage.getItem('adminToken');
  if (!token) return navigate('/');

  const loadUsername = async () => {
    const name = await fetchUserName();
    if (name) setUsername(name);
  };
  loadUsername();
}, []);




useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Only connect if userType is valid
    if (!['1', '2', '3', 'root'].includes(userType?.toString())) return;

    const socket = new WebSocket('ws://localhost:8888');

    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ type: 'auth', token, userType }));
    };


    socket.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);
        if (!res || !res.type) return;

        if (res.type === 'bill' && (userType == '1' || userType == '3' || userType == 'root')) {
          const seen = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
          if (!seen.includes(res.bill_id)) {
            api.info({
              message: 'إشعار جديد',
              description: `عرض سعر جديد من ${res.username} لشركة ${res.companyName}`,
              placement: 'topRight',
              duration: 10
            });
            seen.push(res.bill_id);
            localStorage.setItem('seenNotifications', JSON.stringify(seen));
          }
        }

        if (res.type === 'offer' && (userType == '2' || userType == '3' || userType == 'root')) {
          const seen = JSON.parse(localStorage.getItem('seenOfferNotifications') || '[]');
          if (!seen.includes(res.offer_id)) {
            api.info({
              message: 'إشعار جديد',
              description: `عرض سعر جديد من ${res.username}`,
              placement: 'topRight',
              duration: 10
            });
            seen.push(res.offer_id);
            localStorage.setItem('seenOfferNotifications', JSON.stringify(seen));
          }
        }
      } catch (err) {
        console.error('خطأ في معالجة الإشعار:', err);
      }

      
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      socket.close();
    };
  }, [userType]);


useEffect(() => {
  const fetchType = async () => {
    const type = await fetchUserType();
    setUserType(type)
  }
  if(!userType){
    fetchType();
  }
 
}, [])


useEffect(() => {
  const fetchType = async () => {
    const type = await fetchUserType(); // your API call
    setUserType(type);

    let filteredItems = [];

    if (type === 'root') {
      filteredItems = allMenuItems;
    } else if (type === '0') {
      filteredItems = allMenuItems.filter(item =>
        ['quotation', 'quotation-offer', 'offers', 'bills'].includes(item.key)
      );
    } else if (type === '1') {
      filteredItems = allMenuItems.filter(item =>
        ['received-quotation'].includes(item.key)
      );
    } else if (type === '2') {
      filteredItems = allMenuItems.filter(item =>
        ['received-offer'].includes(item.key)
      );
    } else if (type === '3') {
      filteredItems = allMenuItems.filter(item =>
        ['received-quotation', 'received-offer'].includes(item.key)
      );
    }

    setMenuItems(filteredItems);
  };

  if (!userType) {
    fetchType();
  }
}, []);


  return (
    <Layout style={{ minHeight: '100vh', direction : "rtl" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        className="custom-sider"
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={menuItems}
          className="custom-menu"
        />
      </Sider>

      <Layout>
        <Header
            style={{
              padding: '0 16px',
              background: colorBgContainer,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
           {contextHolder}
           {isDetailPage && <ReturnBtn />}
            

           
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                مرحباً، {username}
              </span>
            </div>
            {/* <Button
              type="primary"
              danger={unseenNotifications.length > 0}
              onClick={() => setDrawerVisible(true)}
            >
              الإشعارات
            </Button> */}

            <Button type="primary" danger onClick={handleLogout}>
              تسجيل الخروج
            </Button>
          </Header>



        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            direction: 'rtl',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
         
          <Routes>
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/bills/:id" element={<BillDetail />} />
            <Route path="/quotation" element={<QuotationForm />} />
            <Route path="/offer-quotation" element={<QuotationOfferForm />} />
            <Route path="/offers/:id" element={<OfferDetail />} />
            <Route path="/received-quotation" element={<ReceiveSalesPage />} />
            <Route path="/received-offer" element={<ReceiveOffersPage />} />
          </Routes>
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPage;