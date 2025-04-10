import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Slide,
  useScrollTrigger,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

interface NavLink {
  to?: string;
  label: string;
  isHighPriority?: boolean;
  subLinks?: Array<{
    to: string;
    label: string;
  }>;
}

interface BaseNavbarProps {
  brandName?: string;
  navLinks: Array<NavLink>;
}

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    target: window,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const BaseNavbar = ({ brandName = "EduManage", navLinks }: BaseNavbarProps) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMenuItems, setOpenMenuItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications = Array.isArray(response.data) ? response.data : [];
        const unreadCount = notifications.filter((n) => !n.read).length;
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    label: string
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveDropdown(label);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveDropdown(null);
  };

  const handleDrawerItemClick = (label: string) => {
    setOpenMenuItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [auth, navigate]);

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={handleDrawerToggle}
      sx={{ "& .MuiDrawer-paper": { width: 280 } }}
    >
      <List>
        {navLinks.map((link) => (
          <Box key={link.label}>
            {link.subLinks ? (
              <>
                <ListItem
                  button
                  onClick={() => handleDrawerItemClick(link.label)}
                >
                  <ListItemText primary={link.label} />
                  {openMenuItems.includes(link.label) ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItem>
                <Collapse
                  in={openMenuItems.includes(link.label)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {link.subLinks.map((subLink) => (
                      <ListItem
                        button
                        key={subLink.to}
                        component={Link}
                        to={subLink.to}
                        onClick={handleDrawerToggle}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText primary={subLink.label} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem
                button
                component={Link}
                to={link.to || "#"}
                onClick={handleDrawerToggle}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            )}
          </Box>
        ))}
        <ListItem>
          <Button
            component={Link}
            to="/dashboard/notifications"
            color="inherit"
            onClick={handleDrawerToggle}
            startIcon={
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            }
          >
            Notifications
          </Button>
        </ListItem>
        <ListItem>
          <Button
            color="error"
            variant="outlined"
            onClick={handleLogout}
            fullWidth
          >
            Logout
          </Button>
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <HideOnScroll>
      <AppBar position="fixed" sx={{ bgcolor: "#3f18e9" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "white",
              "&:hover": {
                color: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            {brandName}
          </Typography>

          {!isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navLinks.map((link) => (
                <Box key={link.label}>
                  {link.subLinks ? (
                    <>
                      <Button
                        color="inherit"
                        onClick={(e) => handleMenuClick(e, link.label)}
                        endIcon={<ExpandMore />}
                      >
                        {link.label}
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={activeDropdown === link.label}
                        onClose={handleMenuClose}
                      >
                        {link.subLinks.map((subLink) => (
                          <MenuItem
                            key={subLink.to}
                            component={Link}
                            to={subLink.to}
                            onClick={handleMenuClose}
                          >
                            {subLink.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  ) : (
                    link.to && (
                      <Button
                        color="inherit"
                        component={Link}
                        to={link.to}
                        sx={link.isHighPriority ? { fontWeight: "bold" } : {}}
                      >
                        {link.label}
                      </Button>
                    )
                  )}
                </Box>
              ))}
              <Button
                component={Link}
                to="/dashboard/notifications"
                color="inherit"
                startIcon={
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                }
              >
                Notifications
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  border: "1px solid",
                  "&:hover": {
                    bgcolor: "error.main",
                    borderColor: "error.main",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
        {renderMobileDrawer()}
      </AppBar>
    </HideOnScroll>
  );
};

export default BaseNavbar;
