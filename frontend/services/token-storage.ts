const getAccessToken: () => string | null = () => {
  return localStorage.getItem("access_token");
};

const setAccessToken: (token: string) => void = (token) => {
  localStorage.setItem("access_token", token);
};

const removeAccessToken: () => void = () => {
  localStorage.removeItem("access_token");
};

export { getAccessToken, setAccessToken, removeAccessToken };
