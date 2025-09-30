import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReturnBtn() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define what you consider the "main" page
  const isMainPage = location.pathname === '/' || location.pathname === '/dashboard';

  if (isMainPage) return null; // 🔒 Hide button on main page

  return (
    <Button
      type="link"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(-1)}
      style={{ marginBottom: 16 }}
    >
      رجوع
    </Button>
  );
}
