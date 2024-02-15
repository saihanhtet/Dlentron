import { loginFunction, registerFunction } from '@renderer/requestJS'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

const Authenticate = () => {
  const [isLogin, setIsLogin] = useState(false)

  const toggleAuthMode = () => {
    setIsLogin((prevState) => !prevState)
  }

  return (
    <div className="d-flex flex-column gap-3 card-xl">
      <Button variant="secondary" type="button" onClick={toggleAuthMode}>
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </Button>
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  )
}

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    console.log('Login form submitted with email:', email, 'and password:', password)
    try {
      const { success, response } = await loginFunction(email, password)
      if (success) {
        console.log(response)
      } else {
        console.log(response)
      }
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="card">
      <h2>Login Form</h2>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Button variant="secondary" type="submit" className="mt-3">
        Login
      </Button>
    </Form>
  )
}

const RegisterForm = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    console.log(
      'Register form submitted with username:',
      username,
      'email:',
      email,
      'and password:',
      password
    )
    try {
      const { success, response } = await registerFunction(username, email, password, password)
      if (success) {
        console.log(response)
      } else {
        console.log(response)
      }
    } catch (error) {
      console.error('Error during register:', error)
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="card">
      <h2>Register</h2>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Form.Text className="text-muted">
          Your username must be unique and between 10 letters.
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Button variant="secondary" type="submit" className="mt-3">
        Register
      </Button>
    </Form>
  )
}

export default Authenticate
