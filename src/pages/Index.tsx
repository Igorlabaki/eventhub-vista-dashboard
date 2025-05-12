
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard page
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-eventhub-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">EventHub</h1>
        <p className="text-xl text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
