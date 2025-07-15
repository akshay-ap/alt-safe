import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { signTypedData } from "@wagmi/core";
import { readContract } from "@wagmi/core";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type Address,
  type Hex,
  type Signature,
  keccak256,
  parseSignature,
  recoverTypedDataAddress,
  serializeSignature,
  toHex,
} from "viem";
import { useAccount } from "wagmi";
import fallbackHandlerABI from "../abis/CompatibilityFallbackHandler.json";
import { useSafeWalletContext } from "../context/WalletContext";
import { config } from "../wagmi";

const SignMessage: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const account = useAccount();

  const [message, setMessage] = useState<string>("");
  const [signatures, setSignatures] = useState<Record<Address, Signature>>({});
  const [encodedSignature, setEncodedSignature] = useState<string>();
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isValidSignature, setIsValidSignature] = useState<boolean>(false);

  const threshold = safeStorage?.threshold ? Number(safeStorage.threshold) : 0;
  const signatureCount = Object.keys(signatures).length;
  const canEncodeSignatures = signatureCount >= threshold;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const EIP712_SAFE_MESSAGE_TYPE = {
    SafeMessage: [{ type: "bytes", name: "message" }],
  };

  const handleSignMessage = async () => {
    if (!message || !safeAccount || !account.chainId || !account.address) {
      setErrors((prev) => [...prev, "Please enter a message and ensure your wallet is connected"]);
      return;
    }

    try {
      const result = await signTypedData(config, {
        domain: {
          chainId: account.chainId,
          verifyingContract: safeAccount,
        },
        types: EIP712_SAFE_MESSAGE_TYPE,
        primaryType: "SafeMessage",
        message: { message: keccak256(toHex(message)) },
      });

      setSignatures((prev) => {
        const parsedSignature = parseSignature(result);
        return {
          ...prev,
          [account.address as Address]: parsedSignature,
        };
      });
    } catch (error) {
      setErrors((prevErrors) => [...prevErrors, `Error signing message: ${error}`]);
    }
  };

  const handleSignatureChange = async (index: number, value: string) => {
    if (!value || value.length < 2) return;

    try {
      if (!message) {
        setErrors((prev) => [...prev, "Please enter a message first"]);
        return;
      }

      const recoveredAddress = await recoverTypedDataAddress({
        domain: {
          chainId: account.chainId,
          verifyingContract: safeAccount,
        },
        types: EIP712_SAFE_MESSAGE_TYPE,
        primaryType: "SafeMessage",
        message: { message: toHex(message) },
        signature: value as `0x${string}`,
      });

      if (!safeStorage?.owners?.includes(recoveredAddress)) {
        setErrors((prevErrors) => [...prevErrors, `Signature ${index + 1} does not match any owners.`]);
        return;
      }

      setSignatures((prev) => {
        return {
          ...prev,
          [recoveredAddress as Address]: parseSignature(value as Hex),
        };
      });
    } catch (error) {
      setErrors((prevErrors) => [...prevErrors, `Error recovering address for signature ${index + 1}: ${error}`]);
    }
  };

  const handleEncodeSignatures = () => {
    if (!canEncodeSignatures) {
      setErrors((prev) => [...prev, `You need ${threshold} signatures to proceed.`]);
      return;
    }

    const addressKeys = Object.keys(signatures) as Address[];
    const sortedAddresses = addressKeys.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

    let encodiedSignatures = "0x";
    for (const signerAddress of sortedAddresses) {
      encodiedSignatures += serializeSignature(signatures[signerAddress]).slice(2);
    }
    setEncodedSignature(encodiedSignatures);
  };

  const handleCheckSignature = async () => {
    setIsValidSignature(false);
    try {
      if (!safeAccount) return;
      const dataHash = keccak256(toHex(message) as `0x${string}`);
      const result = await readContract(config, {
        address: safeAccount,
        abi: fallbackHandlerABI,
        functionName: "isValidSignature",
        args: [dataHash, encodedSignature],
      });

      if (result === "0x1626ba7e") {
        setErrors([]);
        setIsValidSignature(true);
      }
    } catch (error) {
      setErrors((prevErrors) => [...prevErrors, `Error checking signature: ${error}`]);
    }
  };

  const renderSignatureFields = () => {
    if (!safeStorage?.threshold) return [];

    const fields = [];
    const requiredSignatures = Number(safeStorage.threshold);

    // Display your own signature first
    fields.push(
      <Box key="your-sig" mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          Your signature
        </Typography>
        <TextField
          fullWidth
          placeholder="0x..."
          margin="normal"
          value={account.address && signatures[account.address] ? serializeSignature(signatures[account.address]) : ""}
          variant="outlined"
          disabled
          slotProps={{
            input: {
              endAdornment: <Chip label="You" color="primary" size="small" />,
            },
          }}
        />
      </Box>,
    );

    // For other signatures
    if (requiredSignatures > 1) {
      fields.push(
        <Box key="other-sigs" mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Additional signatures required:{" "}
            {requiredSignatures - (account.address && signatures[account.address] ? 1 : 0)} of {requiredSignatures}
          </Typography>
          {Array.from({ length: requiredSignatures - 1 }).map((_, i) => (
            <TextField
              key={`index-${i}-${uuidv4()}`}
              fullWidth
              label={`Signature ${i + 2} of ${requiredSignatures}`}
              placeholder="0x..."
              margin="normal"
              onChange={(e) => handleSignatureChange(i + 1, e.target.value)}
              variant="outlined"
            />
          ))}
        </Box>,
      );
    }

    return fields;
  };

  const handleCopyToClipboard = () => {
    if (encodedSignature) {
      navigator.clipboard.writeText(encodedSignature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          Sign Message for Safe Account
        </Typography>
        {errors.length > 0 && (
          <Box mb={3}>
            <Alert severity="error" onClose={clearErrors} sx={{ mb: 1 }}>
              <Typography variant="subtitle2">There were some issues:</Typography>
              <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                {errors.map((error, index) => (
                  <li key={`${index}-${uuidv4()}`}>{error}</li>
                ))}
              </ul>
            </Alert>
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            onChange={handleChange}
            value={message}
            label="Message to sign"
            placeholder="Enter your message here"
            variant="outlined"
          />
          <Box mt={2}>
            <Button variant="contained" onClick={handleSignMessage} disabled={!message || !account.address}>
              Sign with your wallet
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          {renderSignatureFields()}
          <Box mt={2}>
            <Button
              variant="contained"
              onClick={handleEncodeSignatures}
              disabled={!canEncodeSignatures}
              color="primary"
            >
              Encode signatures
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              placeholder="Encoded signature will appear here"
              margin="normal"
              value={encodedSignature || ""}
              variant="outlined"
              disabled
            />
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton onClick={handleCopyToClipboard} disabled={!encodedSignature}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={1}>
            This encoded signature can be verified by calling ERC-1271 isValidSignature function on the Safe account.
          </Typography>
          <Button variant="contained" onClick={handleCheckSignature}>
            Verify
          </Button>
          {isValidSignature && (
            <Alert severity="success" sx={{ mt: 2 }}>
              The signature is valid!
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SignMessage;
