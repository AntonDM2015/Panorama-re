import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { CityPage } from "./pages/CityPage";
import { BuildingDetailsPage } from "./pages/BuildingDetailsPage";
import { VirtualTourPage } from "./pages/VirtualTourPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/city/:cityId",
    Component: CityPage,
  },
  {
    path: "/city/:cityId/building/:buildingId",
    Component: BuildingDetailsPage,
  },
  {
    path: "/city/:cityId/building/:buildingId/tour",
    Component: VirtualTourPage,
  },
]);