import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import notificationService from "../../services/notificationService";

export default function Navbar() {
    const { user, logout, switchDemoUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [demoOpen, setDemoOpen] = useState(false);

    useEffect(() => {
        if (user) {
            notificationService.getUnreadCount().then((res) => {
                if (res?.unreadCount !== undefined) setUnreadCount(res.unreadCount);
            }).catch(() => {});
        }
    }, [user, location.pathname]);

    const loadNotifications = async () => {
        setNotifOpen(!notifOpen);
        if (!notifOpen && user) {
            try {
                const res = await notificationService.getMyNotifications(0, 5);
                setNotifications(res?.content || []);
            } catch (e) {}
        }
    };

    const handleDemoSwitch = async (roleKey, customEmail = null) => {
        const demoAccounts = {
            CITIZEN: { email: "citizen@sih.gov.in", password: "Password@123", path: "/citizen" },
            ADMIN: { email: "admin@sih.gov.in", password: "Password@123", path: "/admin" },
            UNIVERSITY_IITB: { email: "iitb@sih.gov.in", password: "Password@123", path: "/university" },
            UNIVERSITY_IITM: { email: "iitm@sih.gov.in", password: "Password@123", path: "/university" },
            UNIVERSITY_BHU: { email: "bhu@sih.gov.in", password: "Password@123", path: "/university" },
            UNIVERSITY_BITS: { email: "bits@sih.gov.in", password: "Password@123", path: "/university" },
            FACULTY_IITB: { email: "faculty@iitb.ac.in", password: "Password@123", path: "/faculty" },
            FACULTY_IITM: { email: "faculty@iitm.ac.in", password: "Password@123", path: "/faculty" },
            FACULTY_BHU: { email: "faculty@bhu.ac.in", password: "Password@123", path: "/faculty" },
            FACULTY_BITS: { email: "faculty@bits.ac.in", password: "Password@123", path: "/faculty" },
            STUDENT_IITB: { email: "student@iitb.ac.in", password: "Password@123", path: "/student" },
            STUDENT_IITM: { email: "student@iitm.ac.in", password: "Password@123", path: "/student" },
            STUDENT_BHU: { email: "student@bhu.ac.in", password: "Password@123", path: "/student" },
            STUDENT_BITS: { email: "student@bits.ac.in", password: "Password@123", path: "/student" },
            INDUSTRY: { email: "csr@tata.com", password: "Password@123", path: "/industry" }
        };

        const target = demoAccounts[roleKey] || (customEmail ? { email: customEmail, password: "Password@123", path: "/university" } : null);
        if (target) {
            await switchDemoUser(target);
            setDemoOpen(false);
            navigate(target.path || "/");
        }
    };

    return (
        <header style={{
            background: "linear-gradient(135deg, #0b1733 0%, #17233f 100%)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            position: "sticky",
            top: 0,
            zIndex: 100
        }}>
            {/* Top Govt Bar */}
            <div style={{
                background: "#081024",
                padding: "4px 30px",
                fontSize: "11px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.08)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>🇮🇳 Government of India • Ministry of Education & AICTE</span>
                    <span style={{ color: "#94a3b8" }}>|</span>
                    <span style={{ color: "#38bdf8", fontWeight: 700 }}>SIH26043 National Innovation Platform</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Demo Switcher Pill */}
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setDemoOpen(!demoOpen)}
                            style={{
                                background: "rgba(56, 189, 248, 0.15)",
                                border: "1px solid #38bdf8",
                                color: "#38bdf8",
                                borderRadius: "999px",
                                padding: "2px 10px",
                                fontSize: "10px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                            }}
                        >
                            ⚡ 1-Click Role & University Switcher ({user?.role || "GUEST"}) ▼
                        </button>
                        {demoOpen && (
                            <div style={{
                                position: "absolute",
                                right: 0,
                                top: "24px",
                                background: "#fff",
                                color: "#1e293b",
                                borderRadius: "12px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                                width: "300px",
                                maxHeight: "460px",
                                overflowY: "auto",
                                zIndex: 1000,
                                padding: "8px",
                                border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", padding: "6px 8px", textTransform: "uppercase" }}>Switch Live Demo Account</div>
                                {[
                                    { key: "CITIZEN", label: "👤 Citizen (Rahul Sharma)", desc: "Submit problems, GPS camera, AI intake" },
                                    { key: "ADMIN", label: "🛡️ Govt Admin (Director Varma)", desc: "Review, verify, auto-assign & AI rules" },
                                    
                                    // Universities
                                    { key: "UNIVERSITY_IITB", label: "🏛️ University: IIT Bombay", desc: "IIT Bombay Innovation Cell Portal" },
                                    { key: "UNIVERSITY_IITM", label: "🏛️ University: IIT Madras", desc: "IIT Madras Research Park Portal" },
                                    { key: "UNIVERSITY_BHU", label: "🏛️ University: IIT (BHU) Varanasi", desc: "IIT (BHU) Centre of Excellence Portal" },
                                    { key: "UNIVERSITY_BITS", label: "🏛️ University: BITS Pilani", desc: "BITS Pilani Innovation Hub Portal" },
                                    
                                    // Faculty Mentors
                                    { key: "FACULTY_IITB", label: "🎓 Faculty: Prof. Ananya (IITB)", desc: "IIT Bombay Faculty Mentor & Approvals" },
                                    { key: "FACULTY_IITM", label: "🎓 Faculty: Dr. K. Ramesh (IITM)", desc: "IIT Madras Faculty Mentor & Approvals" },
                                    { key: "FACULTY_BHU", label: "🎓 Faculty: Dr. S.K. Mishra (BHU)", desc: "IIT BHU Faculty Mentor & Approvals" },
                                    { key: "FACULTY_BITS", label: "🎓 Faculty: Dr. Rajesh Gupta (BITS)", desc: "BITS Pilani Faculty Mentor & Approvals" },

                                    // Student Leads
                                    { key: "STUDENT_IITB", label: "🚀 Student: Aarav Patel (IITB)", desc: "IIT Bombay Sprint Tasks & Kanban Board" },
                                    { key: "STUDENT_IITM", label: "🚀 Student: Sneha Reddy (IITM)", desc: "IIT Madras Sprint Tasks & Deliverables" },
                                    { key: "STUDENT_BHU", label: "🚀 Student: Rohan Verma (BHU)", desc: "IIT BHU Sprint Tasks & Deliverables" },
                                    { key: "STUDENT_BITS", label: "🚀 Student: Vikram Deshmukh (BITS)", desc: "BITS Pilani Sprint Tasks & Deliverables" },

                                    // Industry
                                    { key: "INDUSTRY", label: "💼 Industry CSR (Tata Trust)", desc: "Pledge CSR grants, equipment & funding" }
                                ].map((r) => (
                                    <button
                                        key={r.key}
                                        onClick={() => handleDemoSwitch(r.key)}
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "5px 8px",
                                            borderRadius: "8px",
                                            background: (user?.email === "iitb@sih.gov.in" && r.key === "UNIVERSITY_IITB") ||
                                                        (user?.email === "iitm@sih.gov.in" && r.key === "UNIVERSITY_IITM") ||
                                                        (user?.email === "bhu@sih.gov.in" && r.key === "UNIVERSITY_BHU") ||
                                                        (user?.email === "bits@sih.gov.in" && r.key === "UNIVERSITY_BITS") ||
                                                        (user?.email === "faculty@iitb.ac.in" && r.key === "FACULTY_IITB") ||
                                                        (user?.email === "faculty@iitm.ac.in" && r.key === "FACULTY_IITM") ||
                                                        (user?.email === "faculty@bhu.ac.in" && r.key === "FACULTY_BHU") ||
                                                        (user?.email === "faculty@bits.ac.in" && r.key === "FACULTY_BITS") ||
                                                        (user?.email === "student@iitb.ac.in" && r.key === "STUDENT_IITB") ||
                                                        (user?.email === "student@iitm.ac.in" && r.key === "STUDENT_IITM") ||
                                                        (user?.email === "student@bhu.ac.in" && r.key === "STUDENT_BHU") ||
                                                        (user?.email === "student@bits.ac.in" && r.key === "STUDENT_BITS") ||
                                                        (user?.role === r.key) ? "#f0f9ff" : "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "block",
                                            marginBottom: "2px"
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: "11px", color: (user?.role === r.key) ? "#0284c7" : "#0f172a" }}>{r.label}</div>
                                        <div style={{ fontSize: "9px", color: "#64748b" }}>{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 30px",
                maxWidth: "1440px",
                margin: "0 auto"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                    <Link to="/" style={{ textDecoration: "none", color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            fontWeight: 900
                        }}>
                            🌐
                        </div>
                        <div>
                            <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-0.02em" }}>JanNirikshan</div>
                            <div style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "0.08em" }}>CROWDSOURCED SOCIETAL INNOVATION</div>
                        </div>
                    </Link>

                    <nav style={{ display: "flex", gap: "18px", fontSize: "14px", fontWeight: 600 }}>
                        <Link to="/explore" style={{ color: "#e2e8f0", textDecoration: "none" }}>🗺️ Explore Challenges</Link>
                        {user?.role === "CITIZEN" && (
                            <>
                                <Link to="/citizen" style={{ color: location.pathname === "/citizen" ? "#38bdf8" : "#e2e8f0", textDecoration: "none", fontWeight: location.pathname === "/citizen" ? 750 : 600 }}>Dashboard</Link>
                                <Link to="/citizen/report" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 700 }}>+ Submit Challenge</Link>
                                <Link to="/citizen/complaints" style={{ color: location.pathname.startsWith("/citizen/complaints") ? "#38bdf8" : "#e2e8f0", textDecoration: "none", fontWeight: location.pathname.startsWith("/citizen/complaints") ? 750 : 600 }}>My Submissions</Link>
                                <Link to="/citizen/map" style={{ color: location.pathname === "/citizen/map" ? "#38bdf8" : "#e2e8f0", textDecoration: "none", fontWeight: location.pathname === "/citizen/map" ? 750 : 600 }}>Community Map</Link>
                                <Link to="/citizen/notifications" style={{ color: location.pathname === "/citizen/notifications" ? "#38bdf8" : "#e2e8f0", textDecoration: "none", fontWeight: location.pathname === "/citizen/notifications" ? 750 : 600 }}>Notifications</Link>
                                <Link to="/citizen/profile" style={{ color: location.pathname === "/citizen/profile" ? "#38bdf8" : "#e2e8f0", textDecoration: "none", fontWeight: location.pathname === "/citizen/profile" ? 750 : 600 }}>Profile</Link>
                            </>
                        )}
                        {user?.role === "ADMIN" && (
                            <>
                                <Link to="/admin" style={{ color: "#e2e8f0", textDecoration: "none" }}>Command Center</Link>
                                <Link to="/admin/complaints" style={{ color: "#38bdf8", textDecoration: "none" }}>Challenge Moderation</Link>
                                <Link to="/admin/analytics" style={{ color: "#e2e8f0", textDecoration: "none" }}>National Analytics</Link>
                                <Link to="/admin/audit" style={{ color: "#e2e8f0", textDecoration: "none" }}>Audit Log</Link>
                            </>
                        )}
                        {user?.role === "UNIVERSITY" && (
                            <>
                                <Link to="/university" style={{ color: "#e2e8f0", textDecoration: "none" }}>University Cell</Link>
                                <Link to="/university/assigned-challenges" style={{ color: "#38bdf8", textDecoration: "none" }}>Assigned Challenges</Link>
                            </>
                        )}
                        {user?.role === "FACULTY" && (
                            <Link to="/faculty" style={{ color: "#e2e8f0", textDecoration: "none" }}>Faculty Workspace</Link>
                        )}
                        {user?.role === "STUDENT" && (
                            <Link to="/student" style={{ color: "#e2e8f0", textDecoration: "none" }}>Student Workspace</Link>
                        )}
                        {user?.role === "INDUSTRY" && (
                            <Link to="/industry" style={{ color: "#e2e8f0", textDecoration: "none" }}>Industry CSR Hub</Link>
                        )}
                    </nav>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {user ? (
                        <>
                            {/* Notification Bell */}
                            <div style={{ position: "relative" }}>
                                <button
                                    onClick={loadNotifications}
                                    style={{
                                        background: "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        fontSize: "16px"
                                    }}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: "absolute",
                                            top: "-4px",
                                            right: "-4px",
                                            background: "#ef4444",
                                            color: "#fff",
                                            fontSize: "10px",
                                            fontWeight: 800,
                                            borderRadius: "999px",
                                            padding: "2px 6px"
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notifOpen && (
                                    <div style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "44px",
                                        width: "320px",
                                        background: "#fff",
                                        color: "#1e293b",
                                        borderRadius: "14px",
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                                        padding: "14px",
                                        zIndex: 1000,
                                        border: "1px solid #e2e8f0"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                            <strong style={{ fontSize: "14px" }}>Notifications</strong>
                                            <span style={{ fontSize: "11px", color: "#64748b" }}>Recent</span>
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center", padding: "16px" }}>No new notifications</div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12px" }}>
                                                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{n.title}</div>
                                                    <div style={{ color: "#475569", marginTop: "2px" }}>{n.message}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Profile Tag */}
                            <div style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "10px",
                                padding: "4px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: 700 }}>{user.name}</div>
                                    <div style={{ fontSize: "10px", color: "#38bdf8", fontWeight: 800 }}>{user.role}</div>
                                </div>
                                <button
                                    onClick={logout}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#f87171",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link to="/login" className="button secondary" style={{ fontSize: "13px", padding: "8px 16px", color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "transparent" }}>Login</Link>
                            <Link to="/register" className="button primary" style={{ fontSize: "13px", padding: "8px 16px" }}>Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}