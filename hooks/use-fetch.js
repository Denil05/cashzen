"use client";

import { useState } from "react";
import { toast } from "sonner";

const useFetch = (action) => {
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fn = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await action(...args);
            if (response.error) {
                setError(response.error);
                toast.error(response.error);
            } else {
                setData(response);
                setError(null);
            }
        } catch (error) {
            const errorMessage = error.message || "An error occurred";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fn, setData };
};

export default useFetch;