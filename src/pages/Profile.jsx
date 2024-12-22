import { useNavigate, Link } from "react-router";
import { useEffect } from "react";
import { useState } from "react";

export default function Profile({ token }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    if (!token) {
      navigate("/register");
    } else {
      fetch("http://localhost:2000/api/profile", {
        method: "GET",
        headers: { authorization: token },
      })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            return res.json();
          } else {
            setError(true);
            return res.json();
          }
        })
        .then((result) => {
          setUserData(result);
          console.log(result);
        });
    }
  }, [token]);
  if (!userData) {
    return <div>Loading..</div>;
  }
  if (error) {
    navigate("/login");
    return (
      <>
        <button>
          <Link to="/login">login again</Link>
        </button>
        <button>
          <Link to="/register">register</Link>
        </button>
        <div>Your token is not valid, reason: {userData.message}</div>
      </>
    );
  }
  return (
    <div>
      user personal data; email: {userData.email}; password: {userData.pass};
    </div>
  );
}
