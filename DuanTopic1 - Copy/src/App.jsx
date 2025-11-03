
import './styles/globals.css'
import HomePage from './Pages/HomePage';
import Login from './Pages/Login/Login';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dealerstaff from './Pages/DealerStaff/Dealerstaff';
import Dashboard from './Pages/DealerStaff/Dashboard';
import Customer from './Pages/DealerStaff/Customer';
import Order from './Pages/DealerStaff/Order';
import Cardelivery from './Pages/DealerStaff/Cardelivery';
import Paymentcustomer from './Pages/DealerStaff/Paymentcustomer';
import HerioGreen from './components/CarSection/HerioGreen';
import VehicleBrand from './Pages/DealerStaff/VehicleBrand';
import VehicleModel from './Pages/DealerStaff/VehicleModel';
import VehicleVariant from './Pages/DealerStaff/VehicleVariant';
import VehicleColor from './Pages/DealerStaff/VehicleColor';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
     
        <Routes>
          <Route path="/heriogreen" element={<HerioGreen />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          
          <Route path="/home" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          <Route path='/dealerstaff' element={
             <Dealerstaff />
          }>
            <Route path='dashboard' element={<Dashboard />}/>
            <Route path='customer' element={<Customer />} />
            <Route path='order' element = {<Order />} />
            <Route path='cardelivery' element={<Cardelivery />} />
            <Route path='paymentcustomer' element={<Paymentcustomer />} />
            <Route path='vehiclebrand' element={<VehicleBrand />} />
            <Route path='vehiclemodel' element={<VehicleModel />} />
             <Route path='vehiclevariant' element={<VehicleVariant />} />
              <Route path='vehiclcolor' element={<VehicleColor />} />
          </Route>
          
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
