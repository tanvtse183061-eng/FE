
import './styles/globals.css'
import HomePage from './Pages/HomePage';
import Login from './Pages/Login/Login';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dealerstaff from './Pages/DealerStaff/Dealerstaff';
import Dashboard from './Pages/DealerStaff/Dashboard';
import VehicleList from './Pages/DealerStaff/VehicleList';
import CustomerList from './Pages/DealerStaff/CustomerList';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
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
            <Route path='vehicles' element={<VehicleList />}/>
            <Route path='customers' element={<CustomerList />}/>
          </Route>
          
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
