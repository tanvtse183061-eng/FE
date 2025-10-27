import './dealerstaff.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faCar, faMoneyCheckDollar ,faTruck, faUsers, faFileAlt, faSearch, faBell, faEnvelope, faBars,faGrip,faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { InputGroup, FormControl } from "react-bootstrap";
import { Outlet,useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

export default function Dealerstaff() {
 
  const [isCollapsed, setIsCollapsed] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);

 const toggleNotifications = () => {
  setShowNotifications(!showNotifications);
};
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) {
      setUsername(savedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      <div className={`sidebar-card ${isCollapsed ? "collapsed" : ""}`}>
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-icon">
              <FontAwesomeIcon icon={faUserTie} color="white" className="icon" />
            </div>
            {!isCollapsed && (
              <>
                <p className="role">Dealer Staff</p>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>

        <div className="menu">
          {!isCollapsed && <p className="menu-title">Chức năng</p>}
          <ul>
           <li onClick={() => navigate("dashboard")} className='tong'><FontAwesomeIcon icon={faGrip} /><span>Tổng quan</span></li> 
          <li  className='truy'><FontAwesomeIcon icon={faCar} /><span>Truy vấn thông tin xe</span></li>
           <li className='quan'><FontAwesomeIcon icon={faFileAlt} /><span>Báo giá</span></li>
           <li onClick={()=> navigate("customer")} className='hang'><FontAwesomeIcon icon={faUsers} /><span>Khách hàng</span></li>
            <li className='don'><FontAwesomeIcon icon={faShoppingCart} /><span>Đơn hàng</span></li>
           <li className='bao'><FontAwesomeIcon icon={faFileAlt} /><span>Hợp Đồng</span></li>
           <li className ='xe'><FontAwesomeIcon icon={faTruck} /><span>Giao xe</span></li>
           <li className='thanh'><FontAwesomeIcon icon={faMoneyCheckDollar} /><span>Thanh Toán</span></li>
         
          </ul>
        </div>
      </div>

      <div className="header">
        <div className="menu-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </div>
        <div className="search">
          <InputGroup className="search-bar">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} color="green" />
            </InputGroup.Text>
            <FormControl placeholder="Search " />
          </InputGroup>
        </div>
        <div className="header-icons">
             <div className="icon-wrapper">
               <button onClick={toggleNotifications}>
    <FontAwesomeIcon icon={faBell} />
  </button>
  <span className="badge">3</span>

  {showNotifications && (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <FontAwesomeIcon icon={faBell} /> Notifications
      </div>
      <div className="dropdown-item">
        <img src="https://i.pravatar.cc/30?img=1" alt="user" />
        <div>
          <p><strong>John Doe</strong> liked your post</p>
          <span>5 mins ago</span>
        </div>
      </div>
      <div className="dropdown-item">
        <img src="https://i.pravatar.cc/30?img=2" alt="user" />
        <div>
          <p><strong>Moo Doe</strong> liked your cover image</p>
          <span>7 mins ago</span>
        </div>
      </div>
      <div className="dropdown-item">
        <img src="https://i.pravatar.cc/30?img=3" alt="user" />
        <div>
          <p><strong>Lee Doe</strong> commented on your video</p>
          <span>10 mins ago</span>
        </div>
      </div>
      <div className="dropdown-footer">
        <a href="#">View All Notifications</a>
      </div>
    </div>
  )}</div>
           <div className="icon-wrapper"><button>
            <FontAwesomeIcon icon={faEnvelope} />
            </button>
              <span className="badge">3</span>
            </div>
          
          
        </div>
        <div className="staff-name">
          <h2>{username}</h2>
        </div>
        
      </div>
         <div className="content-area">
                  <Outlet />
                           </div>      
    </>
  );
}
