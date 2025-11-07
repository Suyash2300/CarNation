import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/authApi";
import { useAppDispatch } from "../hooks/redux";
import { setCredentials } from "../store/slices/authSlice";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useToast } from "../components/common/ToastContainer";
import { getApiErrorMessage } from "../utils/error";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      showSuccess("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const message = getApiErrorMessage(
        err,
        "Login failed. Please try again."
      );
      showError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 px-4 py-12 sm:py-16">
      <div className="glass rounded-3xl p-6 sm:p-8 md:p-12 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-dark-700">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-dark-700">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
