import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { MyDrops } from "./pages/MyDrops";
import { Explore } from "./pages/Explore";
import { DropViewer } from "./pages/DropViewer";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/my-drops" element={<MyDrops />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/drop/:account/:blobName" element={<DropViewer />} />
      </Route>
    </Routes>
  );
}
