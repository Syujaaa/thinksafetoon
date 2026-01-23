import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Button from "./components/button.jsx";
import Menu from "./pages/Menu.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Menu />
    </>
  );
}

export default App;
