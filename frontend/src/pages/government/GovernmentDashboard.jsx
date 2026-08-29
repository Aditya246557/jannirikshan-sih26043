import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import api from "../../services/api";


export default function GovernmentDashboard() {

    const [stats, setStats] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        load();

    }, []);


    const load = async () => {

        try {

            const response =
                await api.get(
                    "/government/dashboard"
                );

            const d = response.data?.data || response.data;
            setStats({
                total: d.totalComplaints ?? d.total ?? 0,
                submitted: d.pending ?? d.submitted ?? 0,
                inProgress: d.inProgress ?? 0,
                resolved: d.resolved ?? 0,
                underReview: d.underReview ?? 0,
                assigned: d.assigned ?? 0,
                ...d
            });

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load government dashboard."
            );

        } finally {

            setLoading(false);
        }
    };


    if (loading) {

        return (
            <main className="page">

                <div className="loading">
                    Loading government dashboard...
                </div>

            </main>
        );
    }


    if (error) {

        return (
            <main className="page">

                <div className="alert error">
                    {error}
                </div>

            </main>
        );
    }


    const cards = [
        [
            "Total Complaints",
            stats?.total ?? 0,
            "📊",
        ],
        [
            "Submitted",
            stats?.submitted ?? 0,
            "📥",
        ],
        [
            "Under Review",
            stats?.underReview ?? 0,
            "🔎",
        ],
        [
            "Assigned",
            stats?.assigned ?? 0,
            "👤",
        ],
        [
            "In Progress",
            stats?.inProgress ?? 0,
            "⚙️",
        ],
        [
            "Resolved",
            stats?.resolved ?? 0,
            "✅",
        ],
        [
            "Rejected",
            stats?.rejected ?? 0,
            "❌",
        ],
        [
            "High Priority",
            stats?.highPriority ?? 0,
            "🔴",
        ],
    ];


    return (
        <main className="page">

            <div className="page-header">

                <p className="eyebrow">
                    GOVERNMENT PORTAL
                </p>

                <h1>
                    Civic Operations Dashboard
                </h1>

                <p>
                    Monitor, assign and resolve
                    citizen complaints.
                </p>

            </div>


            <div
                className="stats-grid"
            >

                {cards.map(
                    ([title, value, icon]) => (

                        <div
                            className="stat-card"
                            key={title}
                        >

                            <span>
                                {icon}
                            </span>

                            <small>
                                {title}
                            </small>

                            <strong>
                                {value}
                            </strong>

                        </div>

                    )
                )}

            </div>


            <div
                className="dashboard-actions"
            >

                <Link
                    to="/government/complaints"
                    className="button primary"
                >
                    Manage Complaints →
                </Link>

                <Link
                    to="/government/analytics"
                    className="button secondary"
                >
                    View Analytics
                </Link>

            </div>

        </main>
    );
}