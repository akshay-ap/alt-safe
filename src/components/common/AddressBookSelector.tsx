import { ContactsOutlined } from "@mui/icons-material";
import { Box, Divider, IconButton, InputAdornment, Menu, MenuItem, Typography } from "@mui/material";
import React from "react";
import { useAddressBook } from "../../context/AddressBookContext";

export interface AddressBookSelectorProps {
  showAddressBook?: boolean;
  onAddressSelect: (address: string) => void;
  size?: "small" | "medium";
  variant?: "icon" | "menu-only";
}

/**
 * Hook that provides address book selector functionality
 * Returns the menu component and icon button for address book selection
 */
export const useAddressBookSelector = ({
  showAddressBook = true,
  onAddressSelect,
  size = "small",
  variant = "icon",
}: AddressBookSelectorProps) => {
  const { addressBook } = useAddressBook();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleAddressBookClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddressSelect = (address: string) => {
    onAddressSelect(address);
    handleMenuClose();
  };

  // Icon button for input adornment
  const iconButton =
    showAddressBook && addressBook.length > 0 && variant === "icon" ? (
      <InputAdornment position="end">
        <IconButton edge="end" onClick={handleAddressBookClick} aria-label="select from address book" size={size}>
          <ContactsOutlined />
        </IconButton>
      </InputAdornment>
    ) : undefined;

  // Menu component
  const menuComponent = showAddressBook ? (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        style: {
          maxHeight: 300,
          width: "350px",
        },
      }}
    >
      <AddressBookMenuContent addressBook={addressBook} onAddressSelect={handleAddressSelect} />
    </Menu>
  ) : null;

  return {
    iconButton,
    menuComponent,
    isMenuOpen,
    handleAddressBookClick,
    handleMenuClose,
    hasAddresses: addressBook.length > 0,
  };
};

/**
 * Reusable menu content for address book selection
 */
interface AddressBookMenuContentProps {
  addressBook: Array<{
    address: string;
    name: string;
    chainId: number;
  }>;
  onAddressSelect: (address: string) => void;
}

const AddressBookMenuContent: React.FC<AddressBookMenuContentProps> = ({ addressBook, onAddressSelect }) => {
  if (addressBook.length === 0) {
    return (
      <MenuItem disabled>
        <Typography variant="body2" color="textSecondary">
          No addresses in address book
        </Typography>
      </MenuItem>
    );
  }

  return (
    <>
      <MenuItem disabled>
        <Typography variant="overline" color="primary" fontWeight="bold">
          Address Book
        </Typography>
      </MenuItem>
      <Divider />
      {addressBook.map((entry) => (
        <MenuItem
          key={`${entry.address}-${entry.chainId}`}
          onClick={() => onAddressSelect(entry.address)}
          sx={{
            py: 1.5,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
              {entry.name}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              fontFamily="monospace"
              display="block"
              sx={{ mb: 0.25 }}
            >
              {entry.address}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Chain ID: {entry.chainId}
            </Typography>
          </Box>
        </MenuItem>
      ))}
      <Divider />
      <MenuItem disabled>
        <Typography variant="caption" color="textSecondary">
          {addressBook.length} address{addressBook.length !== 1 ? "es" : ""} available
        </Typography>
      </MenuItem>
    </>
  );
};

export default AddressBookMenuContent;
