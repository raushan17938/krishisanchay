import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const userInfo = localStorage.getItem("userInfo");
    const token = localStorage.getItem("token");
    const location = useLocation();

    if (!userInfo || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
