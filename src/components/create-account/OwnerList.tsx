import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { IconButton, Stack, Tooltip } from "@mui/material";
import type { Address } from "viem";
import AddressInput from "../common/AddressInput";

const OwnerList: React.FC<{
  owners: Address[];
  onOwnerChange: (index: number, value: string) => void;
  onRemoveOwner: (index: number) => void;
}> = ({ owners, onOwnerChange, onRemoveOwner }) => (
  <Stack spacing={2}>
    {owners.map((owner, index) => (
      <AddressInput
        key={`owner-${index}`}
        label={`Owner ${index + 1}`}
        value={owner}
        onChange={(value: string) => onOwnerChange(index, value)}
        showAddressBook
        endActions={
          <Tooltip title={owners.length === 1 ? "A Safe needs at least one owner" : "Remove owner"}>
            <span>
              <IconButton
                onClick={() => onRemoveOwner(index)}
                disabled={owners.length === 1}
                edge="end"
                aria-label={`Remove owner ${index + 1}`}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        }
      />
    ))}
  </Stack>
);

export default OwnerList;
