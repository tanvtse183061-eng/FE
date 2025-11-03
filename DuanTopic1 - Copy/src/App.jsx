
import './styles/globals.css'
import HomePage from './Pages/HomePage';
import Login from './Pages/Login/Login';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dealerstaff from './Pages/Admin/Dealerstaff';
import Dashboard from './Pages/Admin/Dashboard';
import Customer from './Pages/Admin/Customer';
import Order from './Pages/Admin/Order';
import Cardelivery from './Pages/Admin/Cardelivery';
import Paymentcustomer from './Pages/Admin/Paymentcustomer';
import HerioGreen from './components/CarSection/HerioGreen';
import VehicleBrand from './Pages/Admin/VehicleBrand';
import VehicleModel from './Pages/Admin/VehicleModel';
import VehicleVariant from './Pages/Admin/VehicleVariant';
import VehicleColor from './Pages/Admin/VehicleColor';
import Dealer from './Pages/Admin/Dealer';
import Warehouse from './Pages/Admin/Warehouse';
import VehicleInventory from './Pages/Admin/VehicleInventory';

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
               <Route path='createdealer' element={<Dealer />} />
                <Route path='warehouse' element={<Warehouse />} />
                 <Route path='vehicleinventory' element={<VehicleInventory />} />
              <></>
          </Route>
          
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
