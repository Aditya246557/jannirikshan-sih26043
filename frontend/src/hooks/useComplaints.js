import {
    useCallback,
    useState,
} from "react";

import complaintService
    from "../services/complaintService";

export default function useComplaints() {

    const [complaints, setComplaints] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadMine = useCallback(
        async (page = 0, size = 10) => {

            setLoading(true);
            setError("");

            try {

                const data =
                    await complaintService.getMine(
                        page,
                        size
                    );

                setComplaints(
                    data.content || []
                );

                return data;

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Unable to load complaints."
                );

                throw error;

            } finally {

                setLoading(false);

            }
        },
        []
    );

    const create = async (data) => {

        setLoading(true);
        setError("");

        try {

            const complaint =
                await complaintService.create(
                    data
                );

            setComplaints(
                (previous) => [
                    complaint,
                    ...previous,
                ]
            );

            return complaint;

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to create complaint."
            );

            throw error;

        } finally {

            setLoading(false);

        }
    };

    return {
        complaints,
        loading,
        error,
        loadMine,
        create,
    };
}