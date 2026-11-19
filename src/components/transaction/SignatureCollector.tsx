import FingerprintIcon from "@mui/icons-material/Fingerprint";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { signTypedData, simulateContract, writeContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import {
  type Address,
  BaseError,
  ContractFunctionRevertedError,
  encodePacked,
  isAddressEqual,
  pad,
  zeroHash,
} from "viem";
import { useAccount } from "wagmi";
import safe from "../../abis/Safe.json";
import { exportSignedTransactionToHex, exportTransactionsToHex } from "../../api/api";
import type { Transaction } from "../../context/types";
import { useSafeWalletContext } from "../../context/WalletContext";
import { mergeSignatures, parseSignatures } from "../../utils/signatures";
import {
  buildSignatureBytes,
  EIP712_SAFE_TX_TYPE,
  fetchApprovals,
  type SafeSignature,
  type SafeTransactionParams,
} from "../../utils/utils";
import { config } from "../../wagmi";
import AccountAddress from "../common/AccountAddress";
import { ShareMenu } from "./create/ExecuteStep";

// v=1 with the owner as r: valid when that owner approved the hash on chain or is the one executing.
const approvalSignature = (owner: Address): SafeSignature => ({
  signer: owner,
  data: encodePacked(["bytes32", "bytes32", "bytes1"], [pad(owner), zeroHash, "0x01"]),
});

const errorMessage = (err: unknown) => {
  if (err instanceof BaseError) {
    const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError)
      return `Execution would fail: ${revert.reason ?? revert.shortMessage}`;
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
};

/**
 * Collects owner signatures for one Safe transaction and executes it once there are enough.
 * Used right after signing a new transaction and on the shared-transaction page.
 */
const SignatureCollector: React.FC<{
  transactions: Transaction[];
  safeTransaction: SafeTransactionParams;
  safeTransactionHash: `0x${string}`;
  initialSignatures?: SafeSignature[];
  onExecuted: (hash: `0x${string}`) => void;
}> = ({ transactions, safeTransaction, safeTransactionHash, initialSignatures = [], onExecuted }) => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const account = useAccount();
  const owners = safeStorage?.owners ?? [];
  const threshold = Number(safeStorage?.threshold ?? 0);
  const isOwner = (address?: string): address is Address =>
    Boolean(address && owners.some((owner) => isAddressEqual(owner, address as Address)));

  const [signatures, setSignatures] = useState<SafeSignature[]>(() =>
    initialSignatures.filter((s) => isOwner(s.signer)),
  );
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const refreshApprovals = () => {
    if (safeAccount && owners.length) fetchApprovals(owners, safeTransactionHash, safeAccount).then(setApprovals);
  };
  useEffect(refreshApprovals, [safeAccount, safeTransactionHash, owners.length]);

  const hasSigned = (owner: Address) => signatures.some((s) => isAddressEqual(s.signer as Address, owner));
  const statusOf = (owner: Address) =>
    hasSigned(owner)
      ? "signed"
      : approvals[owner]
        ? "approved"
        : isAddressEqual(owner, account.address ?? "0x")
          ? "you"
          : "waiting";

  const me = isOwner(account.address) ? account.address : undefined;
  // The executing owner counts as a signer, so the last owner can execute without signing first.
  const executorCounts = Boolean(me && statusOf(me) === "you");
  const confirmed = owners.filter((owner) => ["signed", "approved"].includes(statusOf(owner))).length;
  const canExecute = threshold > 0 && confirmed + (executorCounts ? 1 : 0) >= threshold;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (err) {
      console.error(err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const addSignatures = () =>
    run(async () => {
      setSignatures(mergeSignatures(signatures, await parseSignatures(input, safeTransactionHash, owners)));
      setInput("");
    });

  const sign = () =>
    run(async () => {
      if (!me || !safeAccount) return;
      const data = await signTypedData(config, {
        domain: { chainId: account.chainId, verifyingContract: safeAccount },
        types: EIP712_SAFE_TX_TYPE,
        primaryType: "SafeTx",
        message: { ...safeTransaction },
      });
      setSignatures(mergeSignatures(signatures, [{ signer: me, data }]));
    });

  const execute = () =>
    run(async () => {
      if (!safeAccount) return;
      const collected = owners
        .filter((owner) => statusOf(owner) !== "waiting")
        .map((owner) => signatures.find((s) => isAddressEqual(s.signer as Address, owner)) ?? approvalSignature(owner))
        .slice(0, threshold);
      const { request } = await simulateContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "execTransaction",
        args: [
          safeTransaction.to,
          safeTransaction.value,
          safeTransaction.data,
          safeTransaction.operation,
          safeTransaction.safeTxGas,
          safeTransaction.baseGas,
          safeTransaction.gasPrice,
          safeTransaction.gasToken,
          safeTransaction.refundReceiver,
          buildSignatureBytes(collected),
        ],
      });
      onExecuted(await writeContract(config, request));
    });

  const mySignature = me && signatures.find((s) => isAddressEqual(s.signer as Address, me));
  const shareOptions = [
    ...(signatures.length && safeAccount
      ? [
          {
            label: `Copy transaction with ${signatures.length} signature${signatures.length > 1 ? "s" : ""}`,
            value: exportSignedTransactionToHex({
              transactions,
              safeAccount,
              safeTransaction,
              safeTransactionHash,
              signature: mySignature ?? signatures[0],
              signatures,
            }),
            copiedMessage: "Signed transaction copied",
          },
        ]
      : []),
    ...(mySignature
      ? [{ label: "Copy my signature only", value: mySignature.data, copiedMessage: "Signature copied" }]
      : []),
    ...(safeAccount
      ? [
          {
            label: "Copy transaction only",
            value: exportTransactionsToHex(transactions, safeAccount, safeTransaction, safeTransactionHash),
            copiedMessage: "Transaction copied without signatures",
          },
        ]
      : []),
  ];

  const chip = {
    signed: <Chip size="small" color="success" label="Signed" />,
    approved: <Chip size="small" color="success" label="Approved on chain" />,
    you: <Chip size="small" variant="outlined" label={canExecute ? "You · counts when you execute" : "You"} />,
    waiting: <Chip size="small" variant="outlined" label="Waiting" />,
  };

  return (
    <Paper variant="outlined">
      <Stack direction="row" spacing={1} sx={{ px: 2.5, pt: 2.5, alignItems: "center" }}>
        <Typography variant="h5" component="h2" sx={{ flex: 1 }}>
          Signatures {confirmed} of {threshold}
        </Typography>
        <Button size="small" startIcon={<RefreshIcon />} onClick={refreshApprovals}>
          Check on-chain approvals
        </Button>
        {shareOptions.length > 0 && <ShareMenu options={shareOptions} />}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, pt: 0.5 }}>
        Share the transaction with the other owners over any channel. Paste what they send back below. The owner who
        executes does not need to sign.
      </Typography>

      <Stack sx={{ px: 2.5, py: 1.5 }}>
        {owners.map((owner) => (
          <Stack key={owner} direction="row" spacing={1} sx={{ py: 0.75, alignItems: "center" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <AccountAddress address={owner} short />
            </Box>
            {chip[statusOf(owner)]}
          </Stack>
        ))}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ px: 2.5, pb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Add signatures"
          placeholder="Paste a signature or a signed transaction from another owner"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input && addSignatures()}
        />
        <Button variant="outlined" onClick={addSignatures} disabled={!input || busy} sx={{ flexShrink: 0 }}>
          Add
        </Button>
      </Stack>

      {account.address && !me && (
        <Alert severity="warning" sx={{ mx: 2.5, mb: 2 }}>
          The connected wallet is not an owner, so it cannot sign. It can still execute once enough owners have signed.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mx: 2.5, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: 1,
          borderColor: "divider",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {busy && <CircularProgress size={20} />}
        {me && !hasSigned(me) && (
          <Button
            variant={canExecute ? "outlined" : "contained"}
            startIcon={<FingerprintIcon />}
            onClick={sign}
            disabled={busy}
          >
            Sign
          </Button>
        )}
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={execute} disabled={busy || !canExecute}>
          Execute
        </Button>
      </Stack>
    </Paper>
  );
};

export default SignatureCollector;
