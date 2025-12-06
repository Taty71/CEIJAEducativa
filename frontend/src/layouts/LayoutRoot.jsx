import { Outlet } from "react-router-dom";

import { useUserContext } from "../context/useUserContext";

const LayoutRoot = () => {
    const userContext = useUserContext();
    if (!userContext) {
        console.error("Error: useUserContext() es undefined");
        return null;
    }

    // Si ya hay un usuario definido, renderizamos la vista normal
    return (
        <div>
           { /*<NavMain />*/}
            <Outlet />
        </div>
    );
};

export default LayoutRoot;
