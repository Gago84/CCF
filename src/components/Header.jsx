// Header.jsx
import { NavLink } from "react-router-dom";
import "../styles/header.css";
import UserArea from "./UserArea.jsx";

function Header() {
  return (
    <header>
      <h1>ĐỘI BÓNG CCF</h1>

      <div className="header-row">
        <nav className="main-nav">
          <NavLink to="/" end>Trận đấu</NavLink>
          {/* <NavLink to="/VPP">Danh sách cầu thủ</NavLink> */}
          <NavLink to="/combo">Tài chính</NavLink>
          {/* <NavLink to="/Blog">Báo chí</NavLink> */}
        </nav>

        {/* Bên phải */}
        {/* <div className="user-nav">
          <UserArea />
        </div> */}
      </div>
    </header>
  );
}

export default Header;
