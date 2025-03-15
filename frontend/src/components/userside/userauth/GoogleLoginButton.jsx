import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios"; // Axios for API requests
import { loginn } from "../../../features/userSlice";
import Toast from "../../../utils/Toast"; // 
import apiInstance from "../../../utils/apiInstance";

const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (codeResponse) => {
    const authorizationCode = codeResponse.code;

    try {
      // Send the authorization code to the backend
      const response = await apiInstance.post(
        "/api/login-with-google/",
        { code: authorizationCode }
      );

      const { access_token, refresh_token, username } = response.data;

      // Dispatch login action to update Redux store
      dispatch(
        loginn({
          user: { username: username },
          accessToken: access_token,
          refreshToken: refresh_token,
        })
      );

      // Save tokens with custom names in localStorage
      localStorage.setItem("userAccessToken", access_token);
      localStorage.setItem("userRefreshToken", refresh_token);
      localStorage.setItem("username", username);

      // Show success toast
      Toast("success", "Login successful! Redirecting...");

      // Redirect to the home page after successful login
      navigate("/");
    } catch (error) {
      // Extract error message from backend response or handle network error
      const errorMessage =
        error.response?.data?.error ||
        "Unable to connect to the server. Please try again later.";

      // Show error toast
      Toast("error", errorMessage);
    }
  };

  // Initialize Google Login with the authorization code flow
  const login = useGoogleLogin({
    onSuccess: handleSuccess,
    flow: "auth-code",
  });

  return (
    <div className="flex justify-center my-4">
      <GoogleButton
        onClick={login}
        label="Sign in with Google"
        style={{ width: "317px" }} 
      />
    </div>
  );
};

export default GoogleLoginButton;
