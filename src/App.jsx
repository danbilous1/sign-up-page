import { BrowserRouter, Routes, Route, Link } from "react-router";
import { useState } from "react";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">home </Link>
        {!token ? (
          <>
            <Link to="/register">register </Link>
            <Link to="/login">login </Link>
          </>
        ) : (
          <Link to="/profile">profile</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
        <Route path="/profile" element={<Profile token={token} />} />
        <Route path="login" element={<Login setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
