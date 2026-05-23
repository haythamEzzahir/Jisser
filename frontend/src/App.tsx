import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/student/Dashboard";
import CreditRequest from "@/pages/student/CreditRequest";
import Documents from "@/pages/student/Documents";
import Contract from "@/pages/student/Contract";
import Tracking from "@/pages/student/Tracking";
import CompanyDashboard from "@/pages/company/Dashboard";
import CompanyProfile from "@/pages/company/Profile";
import Needs from "@/pages/company/Needs";
import AssignedStudents from "@/pages/company/AssignedStudents";
import Roi from "@/pages/company/Roi";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminApplications from "@/pages/admin/Applications";
import AdminApplicationDetail from "@/pages/admin/ApplicationDetail";
import AdminMatching from "@/pages/admin/Matching";
import AdminContracts from "@/pages/admin/Contracts";
import AdminPayments from "@/pages/admin/Payments";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/credit-request" element={<CreditRequest />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/needs" element={<Needs />} />
        <Route path="/company/assigned-students" element={<AssignedStudents />} />
        <Route path="/company/roi" element={<Roi />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
        <Route path="/admin/matching" element={<AdminMatching />} />
        <Route path="/admin/contracts" element={<AdminContracts />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
      </Routes>
    </AuthProvider>
  );
}
