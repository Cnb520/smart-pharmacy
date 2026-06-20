import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import TabBar from "@/components/TabBar/TabBar";
import Home from "@/pages/Home/Home";
import DrugCategory from "@/pages/DrugCategory/DrugCategory";
import DrugAll from "@/pages/DrugAll/DrugAll";
import DrugAuth from "@/pages/DrugAuth/DrugAuth";
import DrugAuthSub from "@/pages/DrugAuth/DrugAuthSub";
import DrugRoute from "@/pages/DrugRoute/DrugRoute";
import DrugRouteList from "@/pages/DrugRoute/DrugRouteList";
import DrugDetail from "@/pages/DrugDetail/DrugDetail";
import ArticleDetail from "@/pages/ArticleDetail/ArticleDetail";
import Mine from "@/pages/Mine/Mine";
import Login from "@/pages/Login/Login";
import Favorites from "@/pages/Favorites/Favorites";
import FavoritesDetail from "@/pages/Favorites/FavoritesDetail";
import History from "@/pages/History/History";
import Tools from "@/pages/Tools/Tools";
import Help from "@/pages/Help/Help";
import Search from "@/pages/Search/Search";
import AiChat from "@/pages/AiChat/AiChat";

function Layout() {
  const location = useLocation();

  const showTabBar = location.pathname === '/home' || location.pathname === '/drug-category' || location.pathname === '/mine';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route path="/drug-category" element={<DrugCategory />} />
        <Route path="/drug-category/all" element={<DrugAll />} />
        <Route path="/drug-category/auth" element={<DrugAuth />} />
        <Route path="/drug-category/auth/:type" element={<DrugAuthSub />} />
        <Route path="/drug-category/route" element={<DrugRoute />} />
        <Route path="/drug-category/route/:type" element={<DrugRouteList />} />

        <Route path="/drug/:id" element={<DrugDetail />} />
        <Route path="/article/:id" element={<ArticleDetail />} />

        <Route path="/mine" element={<Mine />} />
        <Route path="/mine/login" element={<Login />} />
        <Route path="/mine/favorites" element={<Favorites />} />
        <Route path="/mine/favorites/:id" element={<FavoritesDetail />} />
        <Route path="/mine/history" element={<History />} />
        <Route path="/mine/tools" element={<Tools />} />
        <Route path="/mine/help" element={<Help />} />

        <Route path="/search" element={<Search />} />
        <Route path="/ai-chat" element={<AiChat />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {showTabBar && <TabBar />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
