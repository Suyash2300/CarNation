import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation, useRegisterMutation } from "../services/authApi";
import { useAppDispatch } from "../hooks/redux";
import { setCredentials } from "../store/slices/authSlice";
import { UserRole } from "../types/auth";
import bannerImage from "../assets/images/banner.png";
import { getApiErrorMessage } from "../utils/error";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    tabParam === "signup" ? "signup" : "login"
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();
  const [register, { isLoading: isRegisterLoading, error: registerError }] =
    useRegisterMutation();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: UserRole.BUYER,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSignupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({
        email: loginData.email,
        password: loginData.password,
      }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(signupData).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const currentError = activeTab === "login" ? loginError : registerError;
  const currentErrorMessage = currentError
    ? getApiErrorMessage(
        currentError,
        "Something went wrong. Please try again."
      )
    : null;
  const isLoading = activeTab === "login" ? isLoginLoading : isRegisterLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950 relative overflow-hidden">
      {/* Background with banner image */}
      <div className="absolute inset-0">
        <img
          src={bannerImage}
          alt="CarNation Banner"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/85 via-dark-800/75 to-dark-900/85"></div>
      </div>

      {/* Dark Header */}
      <nav className="relative z-20 bg-dark-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-white">
              CarNation
            </Link>
            <Link
              to="/"
              className="bg-gradient-primary hover:bg-gradient-primary-dark px-6 py-2 rounded-lg text-sm font-semibold text-white transition shadow-soft hover:shadow-glow"
            >
              Login / Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Central Auth Modal */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 pb-4 text-center font-semibold transition-colors ${
                activeTab === "login"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 pb-4 text-center font-semibold transition-colors ${
                activeTab === "signup"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              {currentErrorMessage && (
                <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-lg">
                  {currentErrorMessage}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleLoginChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-dark-700">
                    Remember Me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition"
                >
                  Forgot Password?
                </Link>
              </div>

              {loginError && "data" in loginError && (
                <div className="bg-error-50 border border-error-300 text-error-700 px-4 py-3 rounded-lg text-sm">
                  {"data" in loginError &&
                  typeof loginError.data === "object" &&
                  loginError.data &&
                  "error" in loginError.data
                    ? String(loginError.data.error)
                    : "Login failed. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <span className="text-xl font-bold text-gray-700">G</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <span className="text-lg font-semibold text-gray-700">f</span>
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              {currentErrorMessage && (
                <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-lg">
                  {currentErrorMessage}
                </div>
              )}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="signup-name"
                  name="name"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    id="signup-password"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-role"
                  className="block text-sm font-medium text-dark-900 mb-2"
                >
                  I want to
                </label>
                <select
                  id="signup-role"
                  name="role"
                  value={signupData.role}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                >
                  <option value={UserRole.BUYER}>Rent or Buy Cars</option>
                  <option value={UserRole.SELLER}>Sell My Car</option>
                </select>
              </div>

              {registerError && "data" in registerError && (
                <div className="bg-error-50 border border-error-300 text-error-700 px-4 py-3 rounded-lg text-sm">
                  {"data" in registerError &&
                  typeof registerError.data === "object" &&
                  registerError.data &&
                  "error" in registerError.data
                    ? String(registerError.data.error)
                    : "Registration failed. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <span className="text-xl font-bold text-gray-700">G</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <span className="text-lg font-semibold text-gray-700">f</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Link */}
          <div className="mt-6 text-center">
            {activeTab === "login" ? (
              <p className="text-sm text-dark-700">
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Sign Up now
                </button>
              </p>
            ) : (
              <p className="text-sm text-dark-700">
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Log In now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
