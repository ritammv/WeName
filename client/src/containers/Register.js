import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import ErrorMessage from '../components/ErrorMessage';
import '../styles/register.scss';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { registerUser} from '../redux/actions';


function Register(props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const onChange = e => {
    setForm((prev) => {
      const newState = {...prev};
      newState[e.target.name] = e.target.value;
      return newState;
    })
  };

  const {
    register,
    errors,
    formState: { isSubmitting }
  } = useForm();

  const handleSubmit = (e) => {
    console.log('trying to register')
    e.preventDefault();
    const userData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    };
    console.log(userData)
    // props.isAuthenticated = true;
    props.registerUser(userData);
    props.history.push('/game');
  };

  // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  // const validateUserName = async value => {
  //   await sleep(1000);
  //   if (value !== "bill") {
  //     setError("username", "validate");
  //   } else {
  //     clearError("username");
  //   }
  // };

  return (
    <div className='registration'>

      <form
        className='registration-form'
        onSubmit={handleSubmit}
        onChange={onChange}
        >
        <h1>Sign Up</h1>
        <label>First Name:</label>
        <input
          className='registration-input'
          name='firstName'
          ref={register({ required: true })} />
        <ErrorMessage error={errors.firstName} />

        <label>Last Name:</label>
        <input
          className='registration-input'
          name="lastName" 
          ref={register({ required: true, minLength: 2 })} />
        <ErrorMessage error={errors.firstName} />

        <label>Email</label>
        <input
          className='registration-input'
          name="email"
          type="email"
          ref={register({ required: true, pattern: /^\S+@\S+$/i })}
        />
        <ErrorMessage error={errors.email || errors.validate} />

        <label>Password</label>
        <input className='registration-input'
          name="password"
          type="password"
          ref={register({ required: true, minLength: 8 })}
        />
        <ErrorMessage error={errors.email} />
          <input className='registration-button' disabled={isSubmitting} type="submit" />
        <h5>Already Registered? <Link to='/login'>Login</Link> here</h5>
      </form>

    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.user
  
})

const mapDispatchToProps = (dispatch) => ({
  registerUser: (userData) => dispatch(registerUser(userData)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);