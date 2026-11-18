import { Box } from "@mui/material";
import type { RpcHealth } from "../../rpc/useRpcHealth";
import { color } from "../../theme/tokens";

export type RpcStatus = "checking" | "ok" | "public" | "failing";

export const getRpcStatus = (health: RpcHealth): RpcStatus => {
  if (!health.result) return "checking";
  if (!health.result.ok) return "failing";
  return health.isConfigured ? "ok" : "public";
};

export const RPC_STATUS_LABEL: Record<RpcStatus, string> = {
  checking: "Checking RPC…",
  ok: "RPC connected",
  public: "Using the public RPC",
  failing: "RPC unreachable or on the wrong chain",
};

const DOT_COLOR: Record<RpcStatus, string> = {
  checking: color.textFaint,
  ok: color.success,
  public: color.warning,
  failing: color.error,
};

const StatusDot: React.FC<{ status: RpcStatus }> = ({ status }) => (
  <Box
    component="span"
    role="img"
    aria-label={RPC_STATUS_LABEL[status]}
    sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: DOT_COLOR[status], flexShrink: 0 }}
  />
);

export default StatusDot;
