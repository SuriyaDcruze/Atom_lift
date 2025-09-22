import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/common/LoadingScreen';


//dashboard selection components
import DashboardSelection from './components/Dashboard selection/DashboardSelection';
import SelectionSidebar from './components/Dashboard selection/Sidebar';
import SelectionNavbar from './components/Dashboard selection/Navbar';
import SelectionHome from './components/Dashboard selection/Home';


// dashboard components
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardPage from './components/Dashboard/Dashboard';
import LiftsPage from './components/Dashboard/Lifts';
import Items from './components/Dashboard/Items';
import CustomerLicense from './components/Dashboard/CustomerLicense';
import AMC from './components/Dashboard/AMC';
import ThisMonthExpire from './components/Dashboard/ThisMonthExpire';
import NextMonthExpire from './components/Dashboard/NextMonthExpire';
import LastMonthExpire from './components/Dashboard/LastMonthExpire';
import Customers from './components/Dashboard/Customers';
import DeliveryChallan from './components/Dashboard/DeliveryChallan';
import Quotation from './components/Dashboard/Quotation';
import Orders from './components/Dashboard/Orders';
import Invoice from './components/Dashboard/Invoice';
import PaymentRecieved from './components/Dashboard/PaymentReceived';
import RecurringInvoices from './components/Dashboard/RecurringInvoices';
import CreditNotes from './components/Dashboard/CreditNotes';
import RoutineServices from './components/Dashboard/RoutineServices';
import TodayServices from './components/Dashboard/TodayServices';
import RouteWiseServices from './components/Dashboard/RouteWiseServices';
import ThisMonthServices from './components/Dashboard/ThisMonthServices';
import LastMonthServices from './components/Dashboard/LastMonthServices';
import ThisMonthOverdue from './components/Dashboard/ThisMonthOverdue';
import LastMonthOverdue from './components/Dashboard/LastMonthOverdue';
import ThisMonthCompleted from './components/Dashboard/ThisMonthCompleted';
import LastMonthCompleted from './components/Dashboard/LastMonthCompleted';
import PendingAssignServices from './components/Dashboard/PendingAssignServices';
import NewItemForm from './components/Dashboard/Forms/NewItemForm';
import Complaints from './components/Dashboard/Complaints';
import Employees from './components/Dashboard/Employees';
import Requisition from './components/Dashboard/Requisition'; 
import Profile from './components/Dashboard/profile'; 
import Settings from './components/Dashboard/Settings'; 
import MonthlyLoad from './components/Dashboard/MonthlyLoad'; 
import RoutineServieSchedule from './components/Dashboard/RoutineServieSchedule';
import StockRegister from './components/Dashboard/StockRegister';
import MaterialRequest from './components/Dashboard/MaterialRequest';
import ComplaintReport from './components/Dashboard/ComplaintReport';
import LifeWiseComplaint from './components/Dashboard/LifeWiseComplaint';
import AMCreport from './components/Dashboard/AMCreport';
import RoutineServiceReport from './components/Dashboard/RoutineServiceReport';
import AMCnextPaymentDueReport from './components/Dashboard/AMCnextPaymentDueReport'; 
import InvoiceReport from './components/Dashboard/InvoiceReport';
import PaymentReport from './components/Dashboard/PaymentReport';  
import QuotationReport from './components/Dashboard/QuotationReport';
import ExpiringReport from './components/Dashboard/ExpiringReport';
import No_Of_Expired_Free_Waranty from './components/Dashboard/No_Of_Expired_Free_Waranty';
import User from './components/Dashboard/User';

// Home component
import Home from './components/Homepage/Home'; // Assuming Home component exists

// Authentication
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import ResetPasswordPage from './components/Authentication/ResetPassword';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate a 2-second loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {loading && <LoadingScreen />}
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />


        {/* Dashboard selection routes */}  
        <Route element={<DashboardSelection/>}>
          <Route path="/dashboard-selection" element={<SelectionHome />} />
        </Route>


        {/* Wrap dashboard routes with the layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/lifts" element={<LiftsPage />} />
          <Route path="/dashboard/items" element={<Items />} />
          <Route path="/dashboard/customer-license" element={<CustomerLicense />} />
          <Route path="/dashboard/amc" element={<AMC />} />
          <Route path="/dashboard/this-month" element={<ThisMonthExpire />} />
          <Route path="/dashboard/next-month" element={<NextMonthExpire />} />
          <Route path="/dashboard/last-month" element={<LastMonthExpire />} />
          <Route path="/dashboard/customers" element={<Customers />} />
          <Route path="/dashboard/delivery-challan" element={<DeliveryChallan />} />
          <Route path="/dashboard/quotation" element={<Quotation />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/dashboard/invoice" element={<Invoice />} />
          <Route path="/dashboard/payment-received" element={<PaymentRecieved />} />
          <Route path="/dashboard/recurring-invoices" element={<RecurringInvoices />} />
          <Route path="/dashboard/credit-notes" element={<CreditNotes />} />
          <Route path="/dashboard/routine-services" element={<RoutineServices />} />
          <Route path="/dashboard/today-services" element={<TodayServices />} />
          <Route path="/dashboard/route-wise-services" element={<RouteWiseServices />} />
          <Route path="/dashboard/this-month-services" element={<ThisMonthServices />} />
          <Route path="/dashboard/last-month-services" element={<LastMonthServices />} />
          <Route path="/dashboard/this-month-overdue" element={<ThisMonthOverdue />} />
          <Route path="/dashboard/last-month-overdue" element={<LastMonthOverdue />} />
          <Route path="/dashboard/this-month-completed" element={<ThisMonthCompleted />} />
          <Route path="/dashboard/last-month-completed" element={<LastMonthCompleted />} />
          <Route path="/dashboard/pending-assign" element={<PendingAssignServices />} />
          <Route path="/dashboard/complaints" element={<Complaints />} />
          <Route path="/dashboard/employees" element={<Employees />} />
          <Route path="/dashboard/requisition" element={<Requisition />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/monthly-load" element={<MonthlyLoad />} />
          <Route path="/dashboard/services-schedule" element={<RoutineServieSchedule />} />
          <Route path="/dashboard/stock-register" element={<StockRegister />} />
          <Route path="/dashboard/material-request" element={<MaterialRequest />} />
          <Route path="/dashboard/complaint-report" element={<ComplaintReport />} />
          <Route path="/dashboard/life-wise-complaint" element={<LifeWiseComplaint />} />
          <Route path="/dashboard/amc-report" element={<AMCreport />} />
          <Route path="/dashboard/routine-services-report" element={<RoutineServiceReport />} />
          <Route path="/dashboard/amc-next-payment-due-report" element={<AMCnextPaymentDueReport />} />
          <Route path="/dashboard/invoice-report" element={<InvoiceReport />} />
          <Route path="/dashboard/payment-report" element={<PaymentReport />} />
          <Route path="/dashboard/quotation-report" element={<QuotationReport />} />
          <Route path="/dashboard/expiring-report" element={<ExpiringReport />} />
          <Route path="/dashboard/expired-free-warranty-report" element={<No_Of_Expired_Free_Waranty />} />
          <Route path="/dashboard/user" element={<User />} />
        </Route>

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
<Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} /> {/* Updated route */}
        {/* New Item Form route */}
      </Routes>
    </Router>
  );
}

export default App;
