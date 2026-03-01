import { Routes, Route } from "react-router-dom";
import Proposal from "./pages/Proposal";
import Host from "./pages/Host";
import Play from "./pages/Play";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Proposal />} />
      <Route path="/host" element={<Host />} />
      <Route path="/play" element={<Play />} />
    </Routes>
  );
}
