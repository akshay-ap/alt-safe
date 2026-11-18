import { Box, Drawer } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavigationBar, { TOP_BAR_HEIGHT } from "./NavigationBar";
import SafeSidebar from "./SafeSidebar";

const SIDEBAR_WIDTH = 248;

const Main: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="main"
    sx={{
      flex: 1,
      minWidth: 0,
      pt: `${TOP_BAR_HEIGHT}px`,
      px: { xs: 2, md: 4 },
      pb: { xs: 6, md: 3 },
      minHeight: "100vh",
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: "auto", pt: { xs: 2, md: 3 } }}>{children}</Box>
  </Box>
);

/** Pages that are not about a single Safe: the Safe list, import, create, settings. */
export const AppLayout: React.FC = () => (
  <>
    <NavigationBar />
    <Main>
      <Outlet />
    </Main>
  </>
);

/** Pages that act on the selected Safe get its identity and navigation in a sidebar. */
export const SafeLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const paperSx = { width: SIDEBAR_WIDTH, boxSizing: "border-box" as const, top: { md: TOP_BAR_HEIGHT } };

  return (
    <Box sx={{ display: "flex" }}>
      <NavigationBar onMenuClick={() => setMobileOpen(true)} />
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: "none" } }}
        slotProps={{ paper: { sx: { ...paperSx, pt: `${TOP_BAR_HEIGHT}px` } } }}
      >
        <SafeSidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", md: "block" }, width: SIDEBAR_WIDTH, flexShrink: 0 }}
        slotProps={{ paper: { sx: { ...paperSx, height: `calc(100% - ${TOP_BAR_HEIGHT}px)` } } }}
      >
        <SafeSidebar />
      </Drawer>
      <Main>
        <Outlet />
      </Main>
    </Box>
  );
};
