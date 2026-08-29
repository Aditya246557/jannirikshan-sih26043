import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import api from "../../services/api";

import complaintService
    from "../../services/complaintService";


const STATUSES = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
    "CLOSED",
];

const PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
];


export default function ComplaintOperations() {

    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [keyword, setKeyword] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [priority, setPriority] =
        useState("");

    const [selected, setSelected] =
        useState(null);

    const [newStatus, setNewStatus] =
        useState("");

    const [remarks, setRemarks] =
        useState("");

    const [saving, setSaving] =
        useState(false);


    useEffect(() => {

        load();

    }, [status, priority]);


    const load = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await api.get(
                    "/government/complaints",
                    {
                        params: {
                            keyword:
                                keyword || undefined,

                            status:
                                status || undefined,

                            priority:
                                priority || undefined,

                            page: 0,
                            size: 100,
                        },
                    }
                );

            setItems(
                response.data?.content ||
                []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load complaints."
            );

        } finally {

            setLoading(false);
        }
    };


    const updateStatus = async () => {

        if (!selected || !newStatus) {
            return;
        }

        setSaving(true);

        try {

            const response =
                await complaintService.updateStatus(
                    selected.id,
                    newStatus,
                    remarks
                );

            setItems((old) =>
                old.map((item) =>
                    item.id === selected.id
                        ? response.data || response
                        : item
                )
            );

            setSelected(
                response.data || response
            );

            setRemarks("");

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Unable to update status."
            );

        } finally {

            setSaving(false);
        }
    };


    const search = (e) => {

        e.preventDefault();

        load();
    };


    return (
        <main className="page">

            <div className="page-header">

                <p className="eyebrow">
                    GOVERNMENT OPERATIONS
                </p>

                <h1>
                    Complaint Operations
                </h1>

                <p>
                    Review and manage civic
                    complaints from citizens.
                </p>

            </div>


            <form
                className="filter-bar"
                onSubmit={search}
            >

                <input
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(
                            e.target.value
                        )
                    }
                    placeholder="Search complaints..."
                />

                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All statuses
                    </option>

                    {STATUSES.map(
                        (value) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {format(value)}
                            </option>
                        )
                    )}

                </select>


                <select
                    value={priority}
                    onChange={(e) =>
                        setPriority(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All priorities
                    </option>

                    {PRIORITIES.map(
                        (value) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {format(value)}
                            </option>
                        )
                    )}

                </select>


                <button
                    className="button primary"
                    type="submit"
                >
                    Search
                </button>

            </form>


            {error && (
                <div className="alert error">
                    {error}
                </div>
            )}


            {loading ? (

                <div className="loading">
                    Loading complaints...
                </div>

            ) : (

                <div className="operations-layout">

                    <section
                        className="complaint-operation-list"
                    >

                        {items.map(
                            (item) => (

                                <button
                                    type="button"
                                    key={item.id}
                                    className={
                                        selected?.id === item.id
                                            ? "operation-card selected"
                                            : "operation-card"
                                    }
                                    onClick={() => {

                                        setSelected(
                                            item
                                        );

                                        setNewStatus(
                                            item.status ||
                                            "SUBMITTED"
                                        );

                                    }}
                                >

                                    <div>

                                        <strong>
                                            #{item.id}{" "}
                                            {item.title}
                                        </strong>

                                        <p>
                                            {item.description}
                                        </p>

                                    </div>


                                    <div>

                                        <span>
                                            {format(
                                                item.status
                                            )}
                                        </span>

                                        <span>
                                            {format(
                                                item.priority
                                            )}
                                        </span>

                                    </div>

                                </button>

                            )
                        )}


                        {!items.length && (

                            <div className="empty-state">

                                No complaints found.

                            </div>

                        )}

                    </section>


                    <section
                        className="operation-detail"
                    >

                        {!selected ? (

                            <div className="empty-state">

                                <h2>
                                    Select a complaint
                                </h2>

                                <p>
                                    Choose a complaint
                                    from the list to
                                    manage it.
                                </p>

                            </div>

                        ) : (

                            <>

                                <div>

                                    <p className="eyebrow">
                                        COMPLAINT #{selected.id}
                                    </p>

                                    <h2>
                                        {selected.title}
                                    </h2>

                                    <p>
                                        {selected.description}
                                    </p>

                                </div>


                                <div className="info-grid">

                                    <div>
                                        <small>
                                            Citizen
                                        </small>

                                        <strong>
                                            {selected.createdByName ||
                                                "Unknown"}
                                        </strong>
                                    </div>


                                    <div>
                                        <small>
                                            Category
                                        </small>

                                        <strong>
                                            {selected.category}
                                        </strong>
                                    </div>


                                    <div>
                                        <small>
                                            Priority
                                        </small>

                                        <strong>
                                            {format(
                                                selected.priority
                                            )}
                                        </strong>
                                    </div>


                                    <div>
                                        <small>
                                            Department
                                        </small>

                                        <strong>
                                            {selected.assignedDepartmentId
                                                ? `#${selected.assignedDepartmentId}`
                                                : "Unassigned"}
                                        </strong>
                                    </div>


                                    <div>
                                        <small>
                                            Officer
                                        </small>

                                        <strong>
                                            {selected.assignedOfficerId
                                                ? `#${selected.assignedOfficerId}`
                                                : "Unassigned"}
                                        </strong>
                                    </div>

                                </div>


                                <div
                                    className="operation-actions"
                                >

                                    <label>

                                        Status

                                        <select
                                            value={newStatus}
                                            onChange={(e) =>
                                                setNewStatus(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            {STATUSES.map(
                                                (value) => (

                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {format(
                                                            value
                                                        )}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </label>


                                    <label>

                                        Resolution remarks

                                        <textarea
                                            rows={4}
                                            value={remarks}
                                            onChange={(e) =>
                                                setRemarks(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Add an official update..."
                                        />

                                    </label>


                                    <button
                                        className="button primary"
                                        disabled={saving}
                                        onClick={
                                            updateStatus
                                        }
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Update Complaint"}
                                    </button>


                                    {selected.latitude != null && (
                                        <Link
                                            className="button secondary"
                                            to={`/citizen/complaints/${selected.id}`}
                                        >
                                            Open Complaint Details
                                        </Link>
                                    )}

                                </div>


                                {selected.aiCategory && (

                                    <div
                                        className="ai-panel"
                                    >

                                        <h3>
                                            🤖 AI Analysis
                                        </h3>

                                        <p>
                                            Category:{" "}
                                            <strong>
                                                {
                                                    selected.aiCategory
                                                }
                                            </strong>
                                        </p>

                                        <p>
                                            Priority:{" "}
                                            <strong>
                                                {format(
                                                    selected.aiPriority
                                                )}
                                            </strong>
                                        </p>

                                        <p>
                                            Confidence:{" "}
                                            <strong>
                                                {selected.aiConfidence != null
                                                    ? `${(
                                                        Number(
                                                            selected.aiConfidence
                                                        ) <= 1
                                                            ? Number(
                                                            selected.aiConfidence
                                                        ) * 100
                                                            : Number(
                                                                selected.aiConfidence
                                                            )
                                                    ).toFixed(1)}%`
                                                    : "N/A"}
                                            </strong>
                                        </p>

                                    </div>

                                )}

                            </>

                        )}

                    </section>

                </div>

            )}

        </main>
    );
}


function format(value) {

    if (!value) {
        return "—";
    }

    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (char) =>
                char.toUpperCase()
        );
}