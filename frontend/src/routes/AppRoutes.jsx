import { Route, Routes } from "react-router-dom";

// Public & Common
import Landing from "../pages/Landing";
import NotFound from "../pages/NotFound";
import ExploreChallenges from "../pages/explore/ExploreChallenges";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Citizen
import CitizenLayout from "../components/layout/CitizenLayout";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import SubmitComplaint from "../pages/citizen/SubmitComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import ComplaintDetails from "../pages/citizen/ComplaintDetails";
import CommunityMap from "../pages/citizen/CommunityMap";
import Notifications from "../pages/citizen/Notifications";
import Profile from "../pages/citizen/Profile";

// Government
import GovernmentLayout from "../layouts/GovernmentLayout";
import GovernmentDashboard from "../pages/government/GovernmentDashboard";
import ComplaintOperations from "../pages/government/ComplaintOperations";

// Admin
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminComplaints from "../pages/admin/AdminComplaints";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AnalyticsDashboard from "../pages/analytics/AnalyticsDashboard";

// University, Faculty, Student, Industry, Projects
import UniversityDashboard from "../pages/university/UniversityDashboard";
import UniversityProposals from "../pages/university/UniversityProposals";
import UniversityResources from "../pages/university/UniversityResources";

import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import FacultyReviews from "../pages/faculty/FacultyReviews";
import FacultyTeam from "../pages/faculty/FacultyTeam";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentWorkspace from "../pages/student/StudentWorkspace";
import StudentSkills from "../pages/student/StudentSkills";

import IndustryDashboard from "../pages/industry/IndustryDashboard";
import IndustryPartnerships from "../pages/industry/IndustryPartnerships";
import IndustryImpact from "../pages/industry/IndustryImpact";

import ProjectDetails from "../pages/project/ProjectDetails";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Entry & Explorers */}
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<ExploreChallenges />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />

            {/* Citizen Portal */}
            <Route element={<ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]} />}>
                <Route path="/citizen" element={<CitizenLayout />}>
                    <Route index element={<CitizenDashboard />} />
                    <Route path="report" element={<SubmitComplaint />} />
                    <Route path="complaints" element={<MyComplaints />} />
                    <Route path="complaints/:id" element={<ComplaintDetails />} />
                    <Route path="map" element={<CommunityMap />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>

            {/* Government Portal */}
            <Route element={<ProtectedRoute allowedRoles={["GOVERNMENT", "ADMIN"]} />}>
                <Route path="/government" element={<GovernmentLayout />}>
                    <Route index element={<GovernmentDashboard />} />
                    <Route path="complaints" element={<ComplaintOperations />} />
                    <Route path="analytics" element={<AnalyticsDashboard />} />
                </Route>
            </Route>

            {/* Admin Command Center */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "GOVERNMENT"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="complaints" element={<AdminComplaints />} />
                    <Route path="audit" element={<AdminAuditLogs />} />
                    <Route path="analytics" element={<AnalyticsDashboard />} />
                </Route>
            </Route>

            {/* University Portal & Sub-Modules */}
            <Route element={<ProtectedRoute allowedRoles={["UNIVERSITY", "ADMIN"]} />}>
                <Route path="/university" element={<UniversityDashboard />} />
                <Route path="/university/assigned-challenges" element={<UniversityDashboard />} />
                <Route path="/university/proposals" element={<UniversityProposals />} />
                <Route path="/university/resources" element={<UniversityResources />} />
            </Route>

            {/* Faculty Portal & Sub-Modules */}
            <Route element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]} />}>
                <Route path="/faculty" element={<FacultyDashboard />} />
                <Route path="/faculty/reviews" element={<FacultyReviews />} />
                <Route path="/faculty/team" element={<FacultyTeam />} />
            </Route>

            {/* Student Workspace & Sub-Modules */}
            <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]} />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/workspace" element={<StudentWorkspace />} />
                <Route path="/student/profile/skills" element={<StudentSkills />} />
            </Route>

            {/* Industry CSR Hub & Sub-Modules */}
            <Route element={<ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]} />}>
                <Route path="/industry" element={<IndustryDashboard />} />
                <Route path="/industry/partnerships" element={<IndustryPartnerships />} />
                <Route path="/industry/impact" element={<IndustryImpact />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}