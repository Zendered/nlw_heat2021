import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

interface IUser {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
}

interface IAuthProvider {
  children: ReactNode;
}

interface IAuthContextData {
  user: IUser | null;
  signInUrl: string;
  singOut: () => void;
}

export const AuthContext = createContext({} as IAuthContextData);

export function AuthProvider(props: IAuthProvider) {
  const [user, setUser] = useState<IUser | null>(null);

  const signInUrl =
    "https://github.com/login/oauth/authorize?scope=user&client_id=85e4640dea308e0ecf46";

  async function signIn(githubCode: string) {
    const response = await api.post<IAuthResponse>("/authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem("@dowhile:token", token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  function singOut() {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");
    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api
        .get<IUser>("profile")
        .then((res) => setUser(res.data))
        .catch((err) => console.log(err));
    }
  }, []);
  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithCode, githubCode] = url.split("?code=");
      window.history.pushState({}, "", urlWithCode);
      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, singOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}
