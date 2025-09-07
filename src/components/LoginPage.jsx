import React from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, message  } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function LoginPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const onFinish = async (values) => {
    try {
      const res = await fetch('/service/adminAuth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username.trim(),
          password: values.password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
         messageApi.open({
            type: 'error',
            content: 'بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.',
            duration: 3,
        });

      }

      // Store token based on "Remember me"
      if (values.remember) {
        localStorage.setItem('adminToken', data.token);
      } else {
        sessionStorage.setItem('adminToken', data.token);
      }

        messageApi.open({
            type: 'success',
            content: 'تم تسجيل الدخول بنجاح. يتم الآن تحويلك إلى الصفحة الرئيسية.',
            duration: 2,
            });
        navigate('/main');
     
    } catch (err) {
      
      // On error
      
        messageApi.open({
            type: 'error',
            content: 'بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.',
        });

    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
    {contextHolder}
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>تسجيل الدخول</Title>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="اسم المستخدم"
            rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="اسم المستخدم" />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="كلمة المرور" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>تذكرني</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              دخول
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
