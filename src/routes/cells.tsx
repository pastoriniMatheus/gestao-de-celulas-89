
import { Route } from 'react-router-dom';
import CellAttendancePage from "../pages/CellAttendancePage";

export const cellRoutes = [
  {
    path: "/cells/:cellId/attendance",
    element: <CellAttendancePage />,
  },
];
