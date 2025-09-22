import { Code as CodeIcon } from "@mui/icons-material";
import { Box, Chip, Divider, IconButton, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { Parser } from "expr-eval";
import { useState } from "react";
import type React from "react";
import { type AbiFunction, encodeFunctionData, parseAbiItem } from "viem";
import type { TransactionSpec } from "../../../context/types";

interface TransactionDebugViewProps {
  spec: TransactionSpec;
  context: Record<string, any>;
  inputs: Record<string, string>;
  errors: Record<string, { id: string; errorMessage: string }[]>;
}

const TransactionDebugView: React.FC<TransactionDebugViewProps> = ({ spec, context, inputs, errors }) => {
  const theme = useTheme();
  const parser = new Parser();
  const [showHexValues, setShowHexValues] = useState<Record<string, boolean>>({});

  // Generate debug calldata and transaction data for preview
  const generateDebugTransaction = (): {
    calldata: string;
    to: string;
    value: string;
    error?: string;
  } => {
    try {
      let calldata: `0x${string}` = "0x";

      if ("data" in spec.onFinalize) {
        calldata = parser.parse(spec.onFinalize.data).evaluate({ context, inputs });
        if (!calldata.startsWith("0x")) {
          throw new Error("Data must start with 0x");
        }
      } else if (!!spec.functionSignature && "calldataArgs" in spec.onFinalize) {
        const abiItem = parseAbiItem(spec.functionSignature) as AbiFunction;
        calldata = encodeFunctionData({
          abi: [abiItem],
          functionName: abiItem.name,
          args: spec.onFinalize.calldataArgs.map((arg) => parser.parse(arg).evaluate({ context, inputs })),
        });
      }

      const to = parser.parse(spec.onFinalize.to).evaluate({ context, inputs });
      const value = parser.parse(spec.onFinalize.value).evaluate({ context, inputs });

      return { calldata, to, value };
    } catch (error) {
      return {
        calldata: "",
        to: "",
        value: "",
        error: `Error: ${error}`,
      };
    }
  };

  // Evaluate individual expressions safely
  const evaluateExpression = (expression: string): { value: any; error?: string } => {
    try {
      const value = parser.parse(expression).evaluate({ context, inputs });
      return { value };
    } catch (error) {
      return { value: undefined, error: `${error}` };
    }
  };

  // Helper function to convert value to hex representation
  const getHexValue = (value: any): string => {
    try {
      if (value === null || value === undefined) return "0x0";
      if (typeof value === "string") {
        // If it's already a hex string, return as is
        if (value.startsWith("0x")) return value;

        // Check if the string represents a number
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
          // If it's a valid number string, convert the number to hex
          return `0x${Math.floor(numericValue).toString(16)}`;
        }

        // Otherwise, convert string to hex using TextEncoder (for actual text)
        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);
        return `0x${Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")}`;
      }
      if (typeof value === "number" || typeof value === "bigint") {
        return `0x${value.toString(16)}`;
      }
      if (typeof value === "boolean") {
        return value ? "0x1" : "0x0";
      }
      // For other types, stringify and convert to hex
      const stringValue = JSON.stringify(value);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(stringValue);
      return `0x${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;
    } catch {
      return "0x0";
    }
  };

  const { calldata, to, value, error: transactionError } = generateDebugTransaction();

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        transition: theme.transitions.create(["box-shadow"], {
          duration: theme.transitions.duration.short,
        }),
        "&:hover": {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Transaction Generation Section - Moved to top to show calldata first */}
        <Box sx={{ mb: 4 }}>
          {/* Final Generated Calldata - Promoted to the top */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="medium">
              Generated Calldata
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "background.default",
                transition: theme.transitions.create(["box-shadow"], {
                  duration: theme.transitions.duration.short,
                }),
                "&:hover": {
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                  Final Transaction Calldata:
                </Typography>
                <Tooltip title={showHexValues.calldata ? "Show Raw" : "Show Decoded"}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setShowHexValues((prev) => ({
                        ...prev,
                        calldata: !prev.calldata,
                      }))
                    }
                    sx={{
                      p: 0.5,
                      transition: theme.transitions.create(["transform"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <CodeIcon fontSize="small" color={showHexValues.calldata ? "primary" : "inherit"} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: transactionError ? "error.light" : "success.light",
                  borderRadius: 1,
                  border: 2,
                  borderColor: transactionError ? "error.main" : "success.main",
                  transition: theme.transitions.create(["transform"], {
                    duration: theme.transitions.duration.short,
                  }),
                  "&:hover": {
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  color={transactionError ? "error.contrastText" : "success.contrastText"}
                  sx={{ wordBreak: "break-all" }}
                >
                  {transactionError || calldata || "0x"}
                </Typography>
                {showHexValues.calldata && !transactionError && calldata && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Calldata breakdown (for debugging):
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace" sx={{ display: "block" }}>
                      Function selector: {calldata.slice(0, 10)}
                    </Typography>
                    {calldata.length > 10 && (
                      <Typography variant="caption" fontFamily="monospace" sx={{ display: "block" }}>
                        Arguments: {calldata.slice(10)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* To Address */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="medium">
              To Address
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "background.default",
                transition: theme.transitions.create(["box-shadow"], {
                  duration: theme.transitions.duration.short,
                }),
                "&:hover": {
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                  Expression:
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    transition: theme.transitions.create(["border-color"], {
                      duration: theme.transitions.duration.short,
                    }),
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {spec.onFinalize.to}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                    Evaluated Result:
                  </Typography>
                  <Tooltip title={showHexValues["to-address"] ? "Show Address" : "Show Hex"}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setShowHexValues((prev) => ({
                          ...prev,
                          "to-address": !prev["to-address"],
                        }))
                      }
                      sx={{
                        p: 0.5,
                        transition: theme.transitions.create(["transform"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <CodeIcon fontSize="small" color={showHexValues["to-address"] ? "primary" : "inherit"} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: transactionError ? "error.light" : "success.light",
                    borderRadius: 1,
                    border: 2,
                    borderColor: transactionError ? "error.main" : "success.main",
                    transition: theme.transitions.create(["transform"], {
                      duration: theme.transitions.duration.short,
                    }),
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    color={transactionError ? "error.contrastText" : "success.contrastText"}
                    sx={{ wordBreak: "break-all" }}
                  >
                    {transactionError || (showHexValues["to-address"] ? getHexValue(to) : to)}
                  </Typography>
                  {showHexValues["to-address"] && !transactionError && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Hex representation
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Value */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="medium">
              Value (wei)
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "background.default",
                transition: theme.transitions.create(["box-shadow"], {
                  duration: theme.transitions.duration.short,
                }),
                "&:hover": {
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                  Expression:
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    transition: theme.transitions.create(["border-color"], {
                      duration: theme.transitions.duration.short,
                    }),
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {spec.onFinalize.value}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                    Evaluated Result:
                  </Typography>
                  <Tooltip title={showHexValues.value ? "Show Decimal" : "Show Hex"}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setShowHexValues((prev) => ({
                          ...prev,
                          value: !prev.value,
                        }))
                      }
                      sx={{
                        p: 0.5,
                        transition: theme.transitions.create(["transform"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <CodeIcon fontSize="small" color={showHexValues.value ? "primary" : "inherit"} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: transactionError ? "error.light" : "success.light",
                    borderRadius: 1,
                    border: 2,
                    borderColor: transactionError ? "error.main" : "success.main",
                    transition: theme.transitions.create(["transform"], {
                      duration: theme.transitions.duration.short,
                    }),
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    color={transactionError ? "error.contrastText" : "success.contrastText"}
                  >
                    {transactionError
                      ? "Error in calculation"
                      : showHexValues.value
                        ? getHexValue(value)
                        : `${value} wei`}
                  </Typography>
                  {showHexValues.value && !transactionError && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Hex representation
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Function Generation Details */}
        {(spec.functionSignature ||
          ("calldataArgs" in spec.onFinalize && spec.onFinalize.calldataArgs) ||
          "data" in spec.onFinalize) && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "background.default",
              transition: theme.transitions.create(["box-shadow"], {
                duration: theme.transitions.duration.short,
              }),
              "&:hover": {
                boxShadow: theme.shadows[2],
              },
            }}
          >
            <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="medium">
              Calldata Generation Details
            </Typography>

            {/* Function Signature */}
            {spec.functionSignature && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                  Function Signature:
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {spec.functionSignature}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Calldata Arguments */}
            {"calldataArgs" in spec.onFinalize && spec.onFinalize.calldataArgs && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                  Calldata Arguments:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {spec.onFinalize.calldataArgs.map((arg, index) => (
                    <Box
                      key={`calldata-arg-${arg.slice(0, 50)}`}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        backgroundColor: "action.hover",
                        borderRadius: 1,
                        transition: theme.transitions.create(["background-color"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      }}
                    >
                      <Typography variant="caption" color="primary.main" fontWeight="bold" gutterBottom>
                        Argument {index}:
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" sx={{ mt: 0.5 }}>
                        {arg}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {(() => {
                          const { value: argValue, error } = evaluateExpression(arg);
                          return (
                            <Typography
                              variant="caption"
                              color={error ? "error.main" : "success.main"}
                              sx={{ fontStyle: error ? "italic" : "normal" }}
                            >
                              → {error || JSON.stringify(argValue)}
                            </Typography>
                          );
                        })()}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Data Expression */}
            {"data" in spec.onFinalize && (
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="medium">
                  Data Expression:
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {spec.onFinalize.data}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Context Values Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
              🌐 Context Values
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "background.default",
              transition: theme.transitions.create(["background-color"], {
                duration: theme.transitions.duration.short,
              }),
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
              },
            }}
          >
            {Object.keys(context).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No context values available for this transaction
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.entries(context).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      transition: theme.transitions.create(["transform"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Chip
                        label={key}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{
                          transition: theme.transitions.create(["background-color"], {
                            duration: theme.transitions.duration.short,
                          }),
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        (context value)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "divider",
                        transition: theme.transitions.create(["border-color", "background-color"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          borderColor: "primary.main",
                          backgroundColor: theme.palette.mode === "dark" ? "grey.800" : "primary.50",
                        },
                      }}
                    >
                      <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                        {value !== null && value !== undefined ? JSON.stringify(value) : "(empty)"}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Input Values & Variable Transformations Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
              Input Values & Variable Transformations
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "background.default",
              transition: theme.transitions.create(["background-color"], {
                duration: theme.transitions.duration.short,
              }),
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
              },
            }}
          >
            {spec.inputs.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No inputs defined for this transaction
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {spec.inputs.map((input) => (
                  <Box
                    key={input.name}
                    sx={{
                      transition: theme.transitions.create(["transform"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Chip
                        label={input.name}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{
                          transition: theme.transitions.create(["background-color"], {
                            duration: theme.transitions.duration.short,
                          }),
                          "&:hover": {
                            backgroundColor: "secondary.light",
                            color: "secondary.contrastText",
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({input.type})
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "divider",
                        transition: theme.transitions.create(["border-color", "background-color"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          borderColor: "primary.main",
                          backgroundColor: theme.palette.mode === "dark" ? "grey.800" : "primary.50",
                        },
                      }}
                    >
                      <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                        "{inputs[input.name] || "(empty)"}"
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Validation Errors Section */}
        {Object.values(errors).flat().length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                Validation Errors
              </Typography>
            </Box>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "error.light",
                transition: theme.transitions.create(["box-shadow"], {
                  duration: theme.transitions.duration.short,
                }),
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {Object.entries(errors).map(([field, fieldErrors]) =>
                fieldErrors.map((error, index) => (
                  <Box
                    key={`${field}-${error.errorMessage}-${index}`}
                    sx={{
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      transition: theme.transitions.create(["transform"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Chip
                      label={field}
                      size="small"
                      color="error"
                      sx={{
                        transition: theme.transitions.create(["background-color"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          backgroundColor: "error.dark",
                        },
                      }}
                    />
                    <Typography variant="body2" color="error.contrastText">
                      {error.errorMessage}
                    </Typography>
                  </Box>
                )),
              )}
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TransactionDebugView;
