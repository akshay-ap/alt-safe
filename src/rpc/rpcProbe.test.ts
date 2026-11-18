import { afterEach, describe, expect, it, vi } from "vitest";
import { probeRpc, RpcProbeError } from "./rpcProbe";

const URL = "https://rpc.example.org";
const SEPOLIA = 11155111;

const respondWith = (body: unknown, init: ResponseInit = { status: 200 }) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), init)));

afterEach(() => vi.unstubAllGlobals());

describe("probeRpc", () => {
  it("sends an eth_chainId JSON-RPC request", async () => {
    respondWith({ jsonrpc: "2.0", id: 1, result: "0xaa36a7" });
    await probeRpc(URL, SEPOLIA);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(URL);
    expect(JSON.parse(init?.body as string)).toMatchObject({ jsonrpc: "2.0", method: "eth_chainId" });
  });

  it("succeeds when the node reports the expected chain", async () => {
    respondWith({ jsonrpc: "2.0", id: 1, result: "0xaa36a7" });
    await expect(probeRpc(URL, SEPOLIA)).resolves.toEqual({ ok: true, chainId: SEPOLIA });
  });

  it("reports a chain mismatch with the chain the node is on", async () => {
    respondWith({ jsonrpc: "2.0", id: 1, result: "0x1" });
    await expect(probeRpc(URL, SEPOLIA)).resolves.toEqual({ ok: false, error: RpcProbeError.WRONG_CHAIN, chainId: 1 });
  });

  it("reports HTTP failures", async () => {
    respondWith({}, { status: 401 });
    await expect(probeRpc(URL, SEPOLIA)).resolves.toEqual({ ok: false, error: RpcProbeError.UNREACHABLE });
  });

  it("reports JSON-RPC errors and malformed results", async () => {
    respondWith({ jsonrpc: "2.0", id: 1, error: { code: -32601, message: "nope" } });
    await expect(probeRpc(URL, SEPOLIA)).resolves.toEqual({ ok: false, error: RpcProbeError.INVALID_RESPONSE });

    respondWith({ jsonrpc: "2.0", id: 1, result: "banana" });
    await expect(probeRpc(URL, SEPOLIA)).resolves.toEqual({ ok: false, error: RpcProbeError.INVALID_RESPONSE });
  });

  it("reports network errors and timeouts as unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(probeRpc(URL, SEPOLIA)).resolves.toEqual({ ok: false, error: RpcProbeError.UNREACHABLE });
  });

  it("rejects invalid URLs without making a request", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await expect(probeRpc("rpc.example.org", SEPOLIA)).resolves.toEqual({
      ok: false,
      error: RpcProbeError.INVALID_URL,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
