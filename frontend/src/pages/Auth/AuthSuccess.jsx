// frontend/src/pages/Auth/AuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../../lib/auth";
import { toast } from "react-toastify";
import api from "../../lib/axios";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      toast.error("Login failed. No token received.");
      return navigate("/login");
    }

    saveToken(token);

    (async () => {
      try {
        const res = await api.get("/auth/me");
        const user = res.data.user;

        toast.success("Google Login Successful!");

        if (user.mustSelectProfession) {
          return navigate("/choose-profession");
        }

        navigate("/dashboard");
      } catch (err) {
        toast.error("Auth verification failed.");
        navigate("/login");
      }
    })();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center text-white text-xl">
      Redirecting...
    </div>
  );
}
