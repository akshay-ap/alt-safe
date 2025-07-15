import DeleteIcon from "@mui/icons-material/Delete";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { type Address, isAddress } from "viem";

const OwnerList: React.FC<{
  owners: Address[];
  onOwnerChange: (index: number, value: string) => void;
  onRemoveOwner: (index: number) => void;
}> = ({ owners, onOwnerChange, onRemoveOwner }) => (
  <>
    <Typography variant="h5">Owners</Typography>
    {owners.map((owner, index) => (
      <Grid container key={owner.concat(index.toString())} size={12}>
        <Grid size={12}>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor={`owner-${index}`}>Owner {index + 1}</InputLabel>
            <OutlinedInput
              id={`owner-${index}`}
              value={owner}
              onChange={(e) => onOwnerChange(index, e.target.value)}
              error={!isAddress(owner)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => onRemoveOwner(index)} edge="end">
                    <DeleteIcon />
                  </IconButton>
                </InputAdornment>
              }
              label={`Owner ${index + 1}`}
            />
            {!isAddress(owner) && <Typography color="error">Invalid address</Typography>}
          </FormControl>
        </Grid>
      </Grid>
    ))}
  </>
);

export default OwnerList;
