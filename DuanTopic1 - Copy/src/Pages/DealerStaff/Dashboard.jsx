import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faUser, faCar, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { useEffect,useState } from 'react';
import API from "../Login/API";
export default function Dashboard() {
  const [orderCount,setOrderCount]=useState(0);
  const [customerCount,setCustomerCount]=useState(0);
  const[vehicleCount,setVehicleCount]=useState(0);
  useEffect(()=>{
    const fectCustomerCount=async ()=>{
      try{
        const res=await API.get('/api/customers');
        setCustomerCount(res.data.length);
      }catch(err){
        console.error("Loi khi lay khach hang:",err);
      }
    };
    fectCustomerCount();
    const interval = setInterval(fectCustomerCount, 5000);
      return () => clearInterval(interval);
  },[]);
  useEffect(()=>{
    const fetchOrderCount=async () =>{
      try{
        const res=await API.get('/api/orders');
        setOrderCount(res.data.length);
      }catch(err){
        console.error("Loi khi lay don hang:",err);
      }
    };
    fetchOrderCount();
     const interval = setInterval(fetchOrderCount, 5000);
      return () => clearInterval(interval);
  },[]);
  useEffect(()=>{
    const fectVehicleCount=async()=>{
      try{
        const res=await API.get('/api/warehouses');
        setVehicleCount(res.data.length);
      }catch(err){
        console.error("Loi khi xe:",err);
      }
    };
    fectVehicleCount();
    const interval = setInterval(fectVehicleCount, 5000);
      return () => clearInterval(interval);
  },[])

  const lists = [
    { id: 1, icon: faCartShopping, color: '#3b82f6', bg: '#e0ecff', title: 'Tổng đơn hàng', number: orderCount, value: '+12%'},
    { id: 2, icon: faUser, color: '#16a34a', bg: '#dcfce7', title: 'Khách hàng', number: customerCount, value: '+8%'},
    { id: 3, icon: faCar, color: '#9333ea', bg: '#f3e8ff', title: 'Xe trong kho', number: vehicleCount, value: '-3%'},
    { id: 4, icon: faMoneyBill, color: '#f59e0b', bg: '#fef3c7', title: 'Doanh thu', number: '0.0M VNĐ', value: '+15%' },
  ];

  return (
    <div className="dashboardf">
      <h1 style={{ fontSize: '20px' }}>Dashboard</h1>
      <div className="dashboard-list">
        {lists.map((list) => (
          <div key={list.id} className="dash">
            <div className="icon-box" style={{ background: list.bg, color: list.color }}>
              <FontAwesomeIcon icon={list.icon} size="lg" />
            </div>
            <div className="number">{list.number}</div>
            <div className="title">{list.title}</div>
           
              {list.value}
            </div>
         
        ))}
      </div>
    </div>
  );
}
