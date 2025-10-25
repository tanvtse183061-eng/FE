import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faUser, faCar, faMoneyBill,faCircleExclamation,faFileInvoice, faUserPlus,  faBoxesStacked,faChartLine } from '@fortawesome/free-solid-svg-icons';
import { useEffect,useState } from 'react';
import API from "../Login/API";
export default function Dashboard() {
  const [orderCount,setOrderCount]=useState(0);
  const [customerCount,setCustomerCount]=useState(0);
  const[vehicleCount,setVehicleCount]=useState(0);
  const [statusorder,setStatusorder]=useState(0);
  const [rencentOrder,setRencentOrder]=useState([]);
  const [rencentCustomer,setRencentCustomer]=useState([]);
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
  useEffect(()=>{
    const fectstatusOrder=async()=>{
      try{
           const res=await API.get('/api/orders/status/PENDING');
            setStatusorder(res.data.length);
      }catch(err){
        console.error("Loi xu li",err);
      }
    
    };
      fectstatusOrder();
      const interval = setInterval(fectstatusOrder, 5000);
      return () => clearInterval(interval);
     
  },[])
 useEffect(() => {
  const fetchRecentOrders = async () => {
    try {
      const res = await API.get("/api/orders");
      if (res.data && res.data.length > 0) {
        const recent = res.data
          .sort((a, b) => b.id - a.id)
          .slice(0, 2);
        setRencentOrder(recent);
      }
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng gần đây:", err);
    }
  };
  fetchRecentOrders();

  const interval = setInterval(fetchRecentOrders, 5000);
  return () => clearInterval(interval);
}, []);
useEffect(()=>{
  const Rcustomer= async()=>{
    try{
      const res=await API.get("/api/customers");
      if(res.data && res.data.length>0){
         const recent = res.data
          .sort((a, b) => b.id - a.id)
          .slice(0, 2);
        setRencentOrder(recent);
      }
    }catch(err){
           console.error("Lỗi khách hàng:", err);
    }
  };
  Rcustomer();
   const interval = setInterval(Rcustomer, 5000);
  return () => clearInterval(interval);
},[]);
  const lists = [
    { id: 1, icon: faCartShopping, color: '#3b82f6', bg: '#e0ecff', title: 'Tổng đơn hàng', number: orderCount, value: '+12%'},
    { id: 2, icon: faUser, color: '#16a34a', bg: '#dcfce7', title: 'Khách hàng', number: customerCount, value: '+8%'},
    { id: 3, icon: faCar, color: '#9333ea', bg: '#f3e8ff', title: 'Xe trong kho', number: vehicleCount, value: '-3%'},
    { id: 4, icon: faMoneyBill, color: '#f59e0b', bg: '#fef3c7', title: 'Doanh thu', number: '0.0M VNĐ', value: '+15%' },
  ];
  const actions = [
    {
      icon: faFileInvoice,
      color: "#3b82f6",
      bg: "#e0ecff",
      border: "#3b82f6",
      title: "Tạo báo giá mới",
      desc: "Tạo báo giá cho khách hàng",
    },
    {
      icon: faUserPlus,
      color: "#16a34a",
      bg: "#dcfce7",
      border: "#16a34a",
      title: "Thêm khách hàng",
      desc: "Đăng ký khách hàng mới",
    },
    {
      icon: faBoxesStacked,
      color: "#9333ea",
      bg: "#f3e8ff",
      border: "#9333ea",
      title: "Quản lý kho",
      desc: "Kiểm tra tồn kho xe",
    },
    {
      icon: faChartLine,
      color: "#f59e0b",
      bg: "#fef3c7",
      border: "#f59e0b",
      title: "Xem báo cáo",
      desc: "Báo cáo doanh số và hiệu suất",
    },
  ];

  return (
    <>
       <div className='Dashboard'>
                <div className="dashboardf">
      <h1 style={{position:'relative',left:'50px' }}>Dashboard</h1>
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
           <div>
            <h3 style={{position:'relative',top:'150px',left:'30px'}}>Thông báo quan trọng </h3>
            <div className='important-notice' >
                <a><FontAwesomeIcon icon={faCircleExclamation} color='red'/>  {statusorder} đơn hàng đang chờ xử lý </a>
            </div>
            <div>
              <h3 style={{position:'relative',top:'200px',left:'30px'}}>Thao tác nhanh</h3>
              <div className="quick-container">
      <div className="quick-list">
        {actions.map((a, i) => (
          <div className="quick-card" key={i} style={{ borderLeft: `4px solid ${a.border}` }}>
            <div className="quick-icon" style={{ background: a.bg, color: a.color }}>
              <FontAwesomeIcon icon={a.icon} size="lg" />
            </div>
            <div>
              <h4 className="quick-title">{a.title}</h4>
              <p className="quick-desc">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
            </div>
           </div>
                   <div className='hoatdong'>
                     <h3>Hoạt động gần đây</h3>
                             {rencentOrder.length > 0 ? (
    <ul className='gan'>
      {rencentOrder.map(o => (
        <li style={{listStyle:'none',position:'relative',left:'-30px'}} key={o.orderId}>Đơn #{o.orderId} -  {o.status}</li>
      ))}
               </ul>
                ) : (
                    <p>Không có đơn hàng gần đây</p>
                     )}
       
                   
</div> 
       </div>
    
    </>
    
  );
}
