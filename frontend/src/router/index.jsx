import { createBrowserRouter } from "react-router-dom";
import LayoutRoot from "../layouts/LayoutRoot";
import LayoutPrivate from "../layouts/LayoutPrivate";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Preinscripcion from "../pages/Preinscripcion";
import PruebaUbicaciones from "../components/PruebaUbicaciones";

export const router = createBrowserRouter([
    {
        path: '/',
        element: (  
                <LayoutRoot />
        ),
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'dashboard',
                element: <LayoutPrivate />,
                children:[
                    {
                        index: true,
                        element: <Dashboard />
                    },
                    {
                        path: 'formulario-inscripcion-adm',
                        element: <Preinscripcion isAdmin={true} />
                    },
                ]
            },
            {
                path: 'preinscripcion-estd',
                element: <Preinscripcion isAdmin={false} />
            },
            {
                path: 'prueba-ubicaciones',
                element: <PruebaUbicaciones />
            }
        ]
    }   
]);