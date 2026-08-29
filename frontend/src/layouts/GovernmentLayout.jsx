import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";


export default function GovernmentLayout() {

    const navigate =
        useNavigate();

    const {
        user,
        logout,
    } = useAuth();


    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };


    return (
        <div className="app-layout">

            {/* ==================================================
                SIDEBAR
               ================================================== */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="brand-title">
                        SIH26043
                    </div>

                    <div className="brand-subtitle">
                        Government Portal
                    </div>

                </div>


                <nav className="sidebar-nav">

                    <NavLink
                        to="/government"
                        end
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/government/complaints"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Complaint Operations
                    </NavLink>


                    <NavLink
                        to="/government/analytics"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Analytics
                    </NavLink>

                </nav>


                <div className="sidebar-footer">

                    <div className="user-info">

                        <strong>
                            {user?.name || "Government User"}
                        </strong>

                        <span>
                            {user?.email || ""}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="nav-link logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* ==================================================
                MAIN CONTENT
               ================================================== */}

            <div className="main-content">

                <header className="topbar">

                    <div>

                        <h1>
                            Government Portal
                        </h1>

                        <p>
                            Complaint monitoring and operations
                        </p>

                    </div>

                </header>


                <main className="content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}