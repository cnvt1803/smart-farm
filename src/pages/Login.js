import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/footer.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
    return (
        <div className="flex h-screen justify-center items-center bg-blue-100">
            <div className="w-full max-w-md flex flex-col justify-center items-center px-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg py-10">
                <img src={Logo} alt="SmartSprout" className="w-24 mb-4" />
                <h2 className="text-3xl font-bold text-greeblue-500 font-dancing">SmartFarm</h2>
                <p className="text-gray-500 mb-6">Welcome to SmartFarm web app</p>

                <form className="w-full" >
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        className="w-full p-3 border rounded-lg mb-4"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="block text-gray-700 font-medium mb-1">PassWord</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full p-3 border rounded-lg mb-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div>
                            <input type="checkbox" id="remember" className="mr-1" />
                            <label htmlFor="remember">Save login</label>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-blue-500 hover:underline"
                        >
                            Forgot password
                        </button>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard")}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Login
                    </button>
                </form>

                <button onClick={() => navigate("/")} className="mt-4 text-blue-500 hover:underline">
                    Back to home page
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
