import { useEffect, useState } from "react";
import api from "../lib/axios";

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error("useFetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  // mutate = re-fetch data manually
  const mutate = () => {
    setLoading(true);
    fetchData();
  };

  return { data, loading, mutate };
}
