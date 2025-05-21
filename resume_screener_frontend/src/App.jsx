import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login';
import Register from './pages/Register';
import RecruiterPortal from './pages/RecruiterPortal';
import ApplicantPortal from './pages/ApplicantPortal';
import PrivateRoute from './routes/PrivateRoute';
import ViewApplications from './pages/ViewApplications';
import PostJob from './pages/PostJob';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/recruiter" element={
          <PrivateRoute allowedRole="recruiter"><RecruiterPortal /></PrivateRoute>
        } /> */}
        <Route path="/recruiter" element={<RecruiterPortal />} />
        <Route path="/jobs/:jobId" element={<ViewApplications />} />
        {/* <Route path="/jobs/:jobId" element={
          <PrivateRoute allowedRole="recruiter"><ViewApplications /></PrivateRoute>
        } /> */}
        
        {/* <Route path="/jobs/:jobId" element={<ViewApplications />} /> */}
        <Route path="/applicant" element={<ApplicantPortal />} />
        {/* <Route path="/applicant" element={
          <PrivateRoute allowedRole="applicant"><ApplicantPortal /></PrivateRoute>
        } /> */}
        
        {/* <Route path="/view-applications" element={
          <PrivateRoute allowedRole="recruiter"><ViewApplications /></PrivateRoute>
        } /> */}
        <Route path="/post-job" element={<PostJob />} />
        
        {/* <Route path="/post-job" element={
          <PrivateRoute allowedRole="recruiter"><PostJob /></PrivateRoute>
        } /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
