// src/pages/MainPage.js
// src/pages/MainPage.js
import React, { useEffect } from 'react';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

const items = [UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map(
  (icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: `القائمة ${index + 1}`,
  })
);

function MainPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
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
  }, [navigate]);

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
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              textAlign: 'center',
            }}
          >
            <Title level={2}>مرحباً بك في التطبيق 🎉</Title>
            <Paragraph>تم تسجيل الدخول بنجاح. يمكنك الآن تصفح المحتوى.</Paragraph>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} تم الإنشاء بواسطة Ant UED
        </Footer>
      </Layout>
    </Layout>
    </>
    
  );
}

export default MainPage;

