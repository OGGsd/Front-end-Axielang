import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxieStudioLogo from "@/assets/AxieStudioLogo.jpg";
import { useLoginUser } from "@/controllers/API/queries/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { SIGNIN_ERROR_ALERT } from "../../../constants/alerts_constants";
import { CONTROL_LOGIN_STATE } from "../../../constants/constants";
import { AuthContext } from "../../../contexts/authContext";
import useAlertStore from "../../../stores/alertStore";
import type { LoginType } from "../../../types/api";
import type {
  inputHandlerEventType,
  loginInputStateType,
} from "../../../types/components";

export default function LoginAdminPage() {
  const [inputState, setInputState] =
    useState<loginInputStateType>(CONTROL_LOGIN_STATE);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { password, username } = inputState;
  const setErrorData = useAlertStore((state) => state.setErrorData);

  function handleInput({
    target: { name, value },
  }: inputHandlerEventType): void {
    setInputState((prev) => ({ ...prev, [name]: value }));
  }

  const { mutate } = useLoginUser();

  function goBack() {
    navigate('/login');
  }

  function signIn() {
    const user: LoginType = {
      username: username,
      password: password,
    };

    mutate(user, {
      onSuccess: (res) => {
        login(res.access_token, "login", res.refresh_token);
      },
      onError: (error) => {
        setErrorData({
          title: SIGNIN_ERROR_ALERT,
          list: [error["response"]["data"]["detail"]],
        });
      },
    });
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
      <div className="flex w-72 flex-col items-center justify-center gap-4">
        {/* Back button */}
        <Button
          onClick={goBack}
          variant="ghost"
          size="sm"
          className="self-start mb-2"
        >
          ← Back to role selection
        </Button>

        <img
          src={AxieStudioLogo}
          alt="Axie Studio logo"
          className="mb-4 h-16 w-auto"
        />
        <div className="text-center mb-6">
          <span className="text-2xl font-semibold text-primary">Admin Access</span>
          <p className="text-sm text-muted-foreground mt-1">
            System administration and user management
          </p>
        </div>

        <Input
          onChange={({ target: { value } }) => {
            handleInput({ target: { name: "username", value } });
          }}
          className="bg-background"
          placeholder="Admin Username"
          value={username}
        />
        <Input
          type="password"
          onChange={({ target: { value } }) => {
            handleInput({ target: { name: "password", value } });
          }}
          className="bg-background"
          placeholder="Admin Password"
          value={password}
        />
        <Button
          onClick={() => {
            signIn();
          }}
          variant="default"
          className="w-full"
        >
          Sign In as Admin
        </Button>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          🛡️ Secure admin access with elevated privileges
        </div>
      </div>
    </div>
  );
}
