import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, InputAdornment, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { Address } from "viem";
import AddressInput from "../common/AddressInput";

const OwnerList: React.FC<{
  owners: Address[];
  onOwnerChange: (index: number, value: string) => void;
  onRemoveOwner: (index: number) => void;
}> = ({ owners, onOwnerChange, onRemoveOwner }) => (
  <>
    <Typography variant="h5">Owners</Typography>
    {owners.map((owner, index) => (
      <Grid container key={`owner-item-${index}`} size={12}>
        <Grid size={12}>
          <AddressInput
            label={`Owner ${index + 1}`}
            value={owner}
            onChange={(value: string) => onOwnerChange(index, value)}
            fullWidth
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => onRemoveOwner(index)} edge="end">
                      <DeleteIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
      </Grid>
    ))}
  </>
);

export default OwnerList;
