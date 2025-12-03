import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../../lib/auth";
import { toast } from "react-toastify";

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
    toast.success("Google Login Successful!");

    setTimeout(() => navigate("/dashboard"), 400);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center text-white text-xl">
      Redirecting...
    </div>
  );
}
