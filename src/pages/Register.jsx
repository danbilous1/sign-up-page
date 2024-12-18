import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router";

export default function Register({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    let info = {
      email: email,
      password: password,
      name: name,
    };
    fetch("http://localhost:2000/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(info),
    })
      .then((res) => {
        if (res.status === 201) {
          return res.json();
        } else {
          setError(true);
        }
      })
      .then((result) => {
        console.log(result);
        localStorage.setItem("token", result.token);
        setToken(result.token);
        navigate("/profile");
      });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email"
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Name</Form.Label>
        <Form.Control
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Enter name"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          value={password}
          onChange={(e) => setPass(e.target.value)}
          type="password"
          placeholder="Password"
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicCheckbox">
        <Form.Check type="checkbox" label="Check me out" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}

