import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  FormControlLabel,
  IconButton,
  ListItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import type React from "react";
import { type AbiFunction, encodeFunctionData, parseAbi, parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useSafeWalletContext } from "../../../context/WalletContext";
import {
  type Transaction,
  type TransactionSpec,
  type TransactionType,
  ValidationType,
  ValueFetchType,
} from "../../../context/types";
import { createBigIntParser } from "../../../utils/parser";
import { config } from "../../../wagmi";
import AccountAddress from "../../common/AccountAddress";
import AddressAutocomplete from "../../common/AddressAutocomplete";
import AddressInput from "../../common/AddressInput";
import TransactionDebugDialog from "../../dialogs/TransactionDebugDialog";

interface TransactionInputBuilderProps {
  onAdd: (transaction: Transaction) => void;
  spec: TransactionSpec;
  groupInfo: {
    name: string;
  };
}

enum DetailValueType {
  Text = "Text",
  Number = "Number",
  Address = "Address",
  BigInt = "BigInt",
}

const TransactionInputBuilder: React.FC<TransactionInputBuilderProps> = ({ onAdd, spec, groupInfo }) => {
  const { chainId } = useAccount();
  const { safeAccount } = useSafeWalletContext();
  const publicClient = usePublicClient();
  const theme = useTheme();

  const parser = createBigIntParser();

  // Initialize state dynamically
  const initialContext = {
    safeAddress: safeAccount,
    ...Object.fromEntries(Object.entries(spec.context || {}).map(([key, item]) => [key, item?.defaultValue])),
  };

  const initialInputs = Object.fromEntries(spec.inputs.map((input) => [input.name, ""]));

  const [context, setContext] = useState<Record<string, any>>(initialContext);
  const [inputs, setInputs] = useState<Record<string, string>>(initialInputs);
  const [errors, setErrors] = useState<Record<string, { id: string; errorMessage: string }[]>>({});
  const [touchedInputs, setTouchedInputs] = useState<Record<string, boolean>>(
    Object.fromEntries(spec.inputs.map((input) => [input.name, false])),
  );
  const [debugDialogOpen, setDebugDialogOpen] = useState<boolean>(false);

  const inputValidations = spec.onUpdateValidations.reduce((acc: Record<string, any[]>, validation) => {
    const { variable, ...rest } = validation;
    const name = variable.split(".")[1];
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(rest);
    return acc;
  }, {});

  const getDetailValue = (type: string, value: string) => {
    const val = parser.parse(value).evaluate({ context, inputs });

    if (val === undefined) {
      return;
    }

    const parsedValue = val.toString();
    switch (type) {
      case DetailValueType.Text:
        return <Typography variant="body2">{parsedValue}</Typography>;
      case DetailValueType.Number:
        return <Typography variant="body2">{val}</Typography>;

      case DetailValueType.Address:
        return (
          <Tooltip title={parsedValue}>
            <span>
              <AccountAddress address={parsedValue} short />
            </span>
          </Tooltip>
        );
      case DetailValueType.BigInt:
        return <Typography variant="body2">{BigInt(val).toString()}</Typography>;
      default:
        return <Typography variant="body2">{value}</Typography>;
    }
  };

  // Fetch context values from blockchain
  /**
   *  biome-ignore lint/correctness/useExhaustiveDependencies(errors): No need to re-run effect when errors changes.
   *  biome-ignore lint/correctness/useExhaustiveDependencies(spec.onInputUpdate): No need to re-run effect as spec is not expectec to change.
   *  biome-ignore lint/correctness/useExhaustiveDependencies(context): Adding context to dependencies will cause infinite re-render.
   *  biome-ignore lint/correctness/useExhaustiveDependencies(parser.parse):
   */
  useEffect(() => {
    // Only run onInputUpdate logic if at least one input has been touched
    const hasAnyTouchedInput = Object.values(touchedInputs).some((touched) => touched);
    if (!hasAnyTouchedInput) {
      return;
    }

    const updateContextValues = async () => {
      for (const update of spec.onInputUpdate) {
        const { variable, value } = update;

        try {
          if (value.type === ValueFetchType.RPC_CALL) {
            const ctx = value.data;
            const abi = parseAbi([ctx.method]) as AbiFunction[];

            const args = ctx.args.map((arg: string) => parser.parse(arg).evaluate({ context, inputs }));
            const to = parser.parse(ctx.to).evaluate({ context, inputs });

            const result = (
              (await readContract(config, {
                address: to,
                abi,
                functionName: abi[0].name,
                args,
              })) as any
            ).toString();

            setContext((prevContext) => ({
              ...prevContext,
              [variable.split(".")[1]]: result,
            }));

            // Remove error with id value.id if it exists in errors
            setErrors((prevErrors) => {
              const currentErrors = prevErrors[variable.split(".")[1]] || [];
              const updatedErrors = currentErrors.filter((err) => err.id !== value.id);
              return { ...prevErrors, [variable.split(".")[1]]: updatedErrors };
            });
          } else if (value.type === ValueFetchType.RPC_GET_BALANCE) {
            const ctx = value.data;
            const arg = parser.parse(ctx.params[0]).evaluate({ context, inputs });
            const result = (await publicClient.getBalance({ address: arg })).toString();

            setContext((prevContext) => ({
              ...prevContext,
              [variable.split(".")[1]]: result,
            }));

            // Remove error with id value.id if it exists in errors
            setErrors((prevErrors) => {
              const currentErrors = prevErrors[variable.split(".")[1]] || [];
              const updatedErrors = currentErrors.filter((err) => err.id !== value.id);
              return { ...prevErrors, [variable.split(".")[1]]: updatedErrors };
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${variable}`);
          console.error(error);
          // update error state
          setErrors((prevErrors) => {
            const errorMessage = value.data.errorMessage || `Failed to fetch data for [${variable}]`;
            const errorKey = variable.split(".")[1];
            const currentErrors = prevErrors[errorKey] || [];
            const updatedErrors = currentErrors.find((err) => err.id === value.id)
              ? currentErrors
              : [...currentErrors, { id: value.id, errorMessage }];
            return {
              ...prevErrors,
              [errorKey]: updatedErrors,
            };
          });
        }
      }
    };

    updateContextValues();
  }, [inputs, publicClient, touchedInputs]);

  useEffect(() => {
    setContext((prevContext) => ({
      ...prevContext,
      safeAddress: safeAccount,
    }));
  }, [safeAccount]);

  /**
   * biome-ignore lint/correctness/useExhaustiveDependencies(context): Valdation should re-run whenever context updates
   * biome-ignore lint/correctness/useExhaustiveDependencies(touchedInputs[name]): No need to re-run validation when touchedInputs changes.
   */
  useEffect(() => {
    for (const name of Object.keys(inputs)) {
      if (touchedInputs[name]) {
        validateInput(name, inputs[name]);
      }
    }
  }, [context, inputs]);

  // Validation logic
  const validateInput = (name: string, value: string) => {
    const errors: { id: string; errorMessage: string }[] = [];

    for (const rule of inputValidations[name] || []) {
      if (rule.type === ValidationType.expression) {
        const result = parser.parse(rule.value).evaluate({ context, inputs });
        if (!result) errors.push({ id: rule.id, errorMessage: rule.errorMessage });
      }
      if (rule.type === ValidationType.regex) {
        if (!new RegExp(rule.value).test(value)) errors.push({ id: rule.id, errorMessage: rule.errorMessage });
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: errors }));
  };

  // Handle input change
  const handleInputChange = (name: string, value: string) => {
    setTouchedInputs((prev) => ({ ...prev, [name]: true }));
    setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
    // validateInput(name, value);
  };

  // Generate transaction calldata
  const handleSubmit = () => {
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

    const transaction: Transaction = {
      type: spec.summaryView as TransactionType,
      groupName: groupInfo.name,
      actionName: spec.name,
      value: parser.parse(spec.onFinalize.value).evaluate({ context, inputs }),
      to: parser.parse(spec.onFinalize.to).evaluate({ context, inputs }),
      data: calldata,
    };

    onAdd(transaction);
  };

  return (
    <Container
      id={`transaction-input-${spec.name?.toLowerCase().replace(/\s+/g, "-")}`}
      sx={{ overflowY: "auto", height: "100%", position: "relative", p: 0 }}
    >
      {/* Single Unified Card */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            p: 3,
          }}
        >
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {groupInfo.name}
            </Typography>
            <PlayArrowIcon sx={{ mx: 1, color: theme.palette.text.disabled, fontSize: 14 }} />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {spec.name}
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <Tooltip title="Show Debug Information">
                <IconButton onClick={() => setDebugDialogOpen(true)} size="small">
                  <DeveloperModeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
              lineHeight: 1.3,
            }}
          >
            {spec.display.description}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            Configure the parameters for this {spec.name.toLowerCase()} transaction
          </Typography>
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
          {/* Input Fields */}
          {spec.inputs.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Parameters
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {spec.inputs.map((input) => (
                  <Box key={input.name}>
                    {input.type === "text" && (
                      <TextField
                        key={`textfield-${spec.name}-${input.name}`}
                        id={`textfield-${spec.name}-${input.name}`}
                        label={input.label}
                        value={inputs[input.name]}
                        onChange={(e) => handleInputChange(input.name, e.target.value)}
                        error={!!errors[input.name]?.length}
                        helperText={errors[input.name]?.map((err) => err.errorMessage).join(", ")}
                        fullWidth
                        variant="outlined"
                        size="medium"
                      />
                    )}

                    {input.type === "address" && (
                      <AddressInput
                        key={`address-${spec.name}-${input.name}`}
                        label={input.label}
                        value={inputs[input.name]}
                        onChange={(value) => handleInputChange(input.name, value)}
                        errorText={errors[input.name]?.map((err) => err.errorMessage).join(", ")}
                        helperText={errors[input.name]?.length > 0 ? undefined : `Enter ${input.label.toLowerCase()}`}
                        showAddressBook={true}
                        fullWidth
                        variant="outlined"
                        size="medium"
                      />
                    )}

                    {input.type === "selectOneRadio" && (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                            mb: 1,
                          }}
                        >
                          {input.label}
                        </Typography>
                        <RadioGroup
                          row
                          name={input.name}
                          value={inputs[input.name]}
                          onChange={(e) => handleInputChange(input.name, e.target.value)}
                        >
                          {(
                            input.options?.find((option) => option.chainId === chainId)?.options ||
                            input.options?.find((option) => option.chainId === 0)?.options ||
                            []
                          ).map((option) => (
                            <FormControlLabel
                              key={`${input.name}-${option.value}`}
                              value={option.value}
                              control={<Radio />}
                              label={option.name}
                            />
                          ))}
                        </RadioGroup>
                      </Box>
                    )}

                    {input.type === "selectOne" && (
                      <Autocomplete
                        id={`selectOne-${spec.name}-${input.name}`}
                        options={
                          input.options?.find((option) => option.chainId === chainId)?.options ||
                          input.options?.find((option) => option.chainId === 0)?.options ||
                          []
                        }
                        getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
                        renderOption={(props, option) => (
                          <ListItem {...props} key={`${option.name}-${option.value}`}>
                            <Grid container justifyContent="space-between" width="100%">
                              <Grid>
                                <Typography>{option.name}</Typography>
                              </Grid>
                              <Grid>
                                <Typography>{option.value}</Typography>
                              </Grid>
                            </Grid>
                          </ListItem>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label={input.label} fullWidth variant="outlined" size="medium" />
                        )}
                        onInputChange={(_event, newValue) => {
                          const selected = input.options
                            ?.find((opt) => opt.chainId === chainId)
                            ?.options.find((opt) => opt.name === newValue);
                          handleInputChange(input.name, selected ? selected.value : newValue);
                        }}
                      />
                    )}

                    {input.type === "selectOneWithFreeSolo" && (
                      <Autocomplete
                        id={`selectOneWithFreeSolo-${spec.name}-${input.name}`}
                        freeSolo={true}
                        options={
                          input.options?.find((option) => option.chainId === chainId)?.options ||
                          input.options?.find((option) => option.chainId === 0)?.options ||
                          []
                        }
                        getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
                        renderOption={(props, option) => (
                          <ListItem {...props} key={`${option.name}-${option.value}`}>
                            <Grid container justifyContent="space-between" width="100%">
                              <Grid>
                                <Typography>{option.name}</Typography>
                              </Grid>
                              <Grid>
                                <Typography>{option.value}</Typography>
                              </Grid>
                            </Grid>
                          </ListItem>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label={input.label} fullWidth variant="outlined" size="medium" />
                        )}
                        onInputChange={(_event, newValue) => {
                          const selected = input.options
                            ?.find((opt) => opt.chainId === chainId)
                            ?.options.find((opt) => opt.name === newValue);
                          handleInputChange(input.name, selected ? selected.value : newValue);
                        }}
                      />
                    )}

                    {input.type === "selectOneWithFreeSoloAddress" && (
                      <AddressAutocomplete
                        value={inputs[input.name]}
                        onChange={(value) => {
                          handleInputChange(input.name, value);
                        }}
                        options={
                          input.options?.find((option) => option.chainId === chainId)?.options ||
                          input.options?.find((option) => option.chainId === 0)?.options ||
                          []
                        }
                        label={input.label}
                        showAddressBook={true}
                        helperText={
                          errors[input.name]?.length > 0 ? undefined : `Enter or select ${input.label.toLowerCase()}`
                        }
                        errorText={errors[input.name]?.map((err) => err.errorMessage).join(", ")}
                        freeSolo={true}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Transaction Preview */}
          {spec.detailsView.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Context
              </Typography>

              <Box
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  borderRadius: 2,
                  p: 2,
                }}
              >
                {spec.detailsView.map((detail, index) => (
                  <Box
                    key={`${index}-${detail.label}`}
                    sx={{
                      display: "flex",
                      py: 1,
                      borderBottom:
                        index < spec.detailsView.length - 1
                          ? `1px solid ${alpha(theme.palette.divider, 0.05)}`
                          : "none",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        minWidth: "100px",
                        flexShrink: 0,
                      }}
                    >
                      {detail.label}:
                    </Typography>
                    <Box sx={{ ml: 2, flex: 1 }}>{getDetailValue(detail.type, detail.value)}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Error Messages */}
          {Object.values(errors).flat().length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.warning.main,
                }}
              >
                Issues
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Object.values(errors)
                  .flat()
                  .map((error, index) => (
                    <Alert
                      key={`${error.id}-${index}`}
                      severity="warning"
                      sx={{
                        borderRadius: 1,
                        "& .MuiAlert-message": {
                          fontSize: "0.875rem",
                        },
                      }}
                    >
                      {error.errorMessage}
                    </Alert>
                  ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer with Submit Button */}
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            p: 3,
            bgcolor: alpha(theme.palette.background.default, 0.3),
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              "&:disabled": {
                bgcolor: alpha(theme.palette.action.disabled, 0.12),
                color: theme.palette.action.disabled,
              },
            }}
          >
            Add to Batch
          </Button>
        </Box>
      </Paper>

      {/* Debug dialog */}
      <TransactionDebugDialog
        open={debugDialogOpen}
        onClose={() => setDebugDialogOpen(false)}
        spec={spec}
        context={context}
        inputs={inputs}
        errors={errors}
      />
    </Container>
  );
};

export default TransactionInputBuilder;
