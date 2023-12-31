import React, {useEffect, useRef, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/inputPages.css';

import CreateUserContainer from "./createUser.jsx";
import PopupContainer from "../components/Popup.jsx";

//text fields
function InputField({labelName, textType, change, changeHandler}) {
  return(
      <form>
        <label>
          {labelName}
        </label>
        <br></br>
        <input
            style={{width: '40ch'}}
            className="inputField"
            type={(!textType && labelName==="Password") ? "password" : "text"}
            value={change}
            onChange={(e) => changeHandler(e.target.value)}
        />
      </form>
  );
}

//show password checkbox
function PasswordCheckbox({change, changeHandler}) {
  return (
      <form>
        <input
            type="checkbox"
            className="form-check-input"
            value={change}
            onChange={(e) => changeHandler(e.target.checked)}
        />
        <label>Show Password</label>
      </form>
  );
}

// Creates a submit type button using the arguments.
function SubmitButton({buttonName, buttonType, change, changeHandler}) {
  return (
      <form className="loginSubmits standardButton">
        <button
            type={buttonType}
            value={change}
            onClick={changeHandler}
        >
            {buttonName}
        </button>
      </form>
  );
}

//container for elements
function LoginContainer({loggedInStatusHandler, loginPopup, loginPopupHandler, buttonRef}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passCheckbox, setPassCheckbox] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target) && buttonRef !== e.current) {
                loginPopupHandler(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };

    }, [loginPopup]);


  const apiUrl = 'http://localhost:5000/api/login';

  async function sendData() {
      const data = {username, password}

      // Default options are marked with *
      try {
          const response = await fetch(apiUrl, {
              method: "POST", // *GET, POST, PUT, DELETE, etc.
              mode: "cors", // no-cors, *cors, same-origin
              cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
              headers: {
                  "Content-Type": "application/json",
                  // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              redirect: "follow", // manual, *follow, error
              referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              body: JSON.stringify(data), // body data type must match "Content-Type" header
          })
          if (response.ok) {
              const valid = await response.json();
              loggedInStatusHandler(true, username);
              window.location.reload();
              console.log(valid.message);
          }
          else {
              loggedInStatusHandler(false);
              console.error('Login failed');

              setPopupMsg("Login failed")
              setIsPopup(true)
          }

      } catch (error) {
          console.error('Error fetching data: ', error);
      }

  }

  const togglePopup = (state) => {
      setTimeout(() => {
          setShowPopup(state);
      }, 0);
  }

    const [isPopup, setIsPopup] = useState(false);
    const [popupMsg, setPopupMsg] = useState("");

    // Time limit for the popup
    useEffect(() => {
        if (isPopup) {
            const timerId = setTimeout(() => {
                setIsPopup(false); // After 5 seconds, set isPopup to false
            }, 5000);

            // Cleanup the timer if the component unmounts or isPopup changes
            return () => clearTimeout(timerId);
        }
    }, [isPopup]);

  return (
    <div className="popup login-container" ref={popupRef}>
        <h1 style={{textAlign: 'center'}}>
            Login
        </h1>

      <InputField
          labelName="Username"
          textType={passCheckbox}
          change={username}
          changeHandler={setUsername} />

      <InputField
          labelName="Password"
          textType={passCheckbox}
          change={password}
          changeHandler={setPassword} />

      <br />

      <PasswordCheckbox
          change={passCheckbox}
          changeHandler={setPassCheckbox} />

      <br />

        <div className="button-row">
      <SubmitButton
          buttonName="CREATE USER"
          buttonType="button"
          change={showPopup}
          changeHandler={togglePopup} />

      <SubmitButton
          buttonName="LOGIN"
          buttonType="button"
          changeHandler={sendData}
      />
        </div>

        <div>
            { showPopup && <CreateUserContainer showPopup={showPopup}
                                                togglePopup={() => togglePopup(!showPopup)}
                                                /> }
        </div>

        <PopupContainer
            isPopupOpen={isPopup}
            message={popupMsg}
        />
    </div>
  );
}

export default LoginContainer
