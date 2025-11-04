# Smart Contract Interaction Template Specification

## Overview
This document specifies the structure for creating templates that facilitate interactions with different smart contracts and a safe smart account. The templates define groups of actions, which are rendered in the UI panel. Each action corresponds to a function call on a smart contract and includes input fields, validation rules, and context updates.

## Context Injection
- The application injects `context.safeAddress` automatically.
- `detailsView` is provided to users to visualize the action details.
- `inputs` support various input types including text fields, address inputs, and selection fields with predefined options.
- `context` is not shown to users but updates dynamically when inputs change.
- `validations` are triggered upon changes in `inputs` and `context`.
- `functionSignature` defines the function call on the smart contract, using values from `onFinalize`.

## Specification

### Transaction Group Specification
Each transaction group consists of multiple actions, categorized by their functionality.

```json
{
  "groupName": "<Group Name>",
  "tags": ["<GroupTagType>"],
  "logo": {
    "type": "character|url",  
    "value": "<Character or URL>"
  },
  "chainIds": [<List of Supported Chain IDs, use 0 for all chains>],
  "actions": [
    {
      "name": "<Action Name>",
      "display": {
        "description": "<Description of Action>"
      },
      "functionSignature": "function transfer(address _to, uint256 _value) public returns (bool success)",
      "summaryView": "<TransactionType>",
      "context": {
        "<Variable Name>": {
          "type": "<Data Type>",
          "defaultValue": "<Default Value>"
        }
      },
      "inputs": [
        {
          "name": "<Input Variable Name>",
          "label": "<Input Label>",
          "type": "<InputTypeType>",
          "options": [
            {
              "chainId": <Chain ID>,
              "options": [
                { "name": "<Option Name>", "value": "<Option Value>" }
              ]
            }
          ]
        }
      ],
      "onInputUpdate": [
        {
          "variable": "<Context Variable>",
          "value": {
            "type": "<ValueFetchType>",
            "id": "<Unique ID>",
            "data": {
              "method": "<Smart Contract Read Method>",
              "to": "inputs.<Input Variable>",
              "args": ["context.safeAddress"],
              "errorMessage": "<Optional Error Message>"
            }
          }
        }
      ],
      "detailsView": [
        {
          "label": "<Detail Label>",
          "value": "<Context Variable or Computed Expression>",
          "type": "<Display Type>"
        }
      ],
      "onUpdateValidations": [
        {
          "variable": "inputs.<Input Variable>",
          "type": "<ValidationType>",
          "id": "<Validation ID>",
          "value": "<Validation Expression>",
          "errorMessage": "<Error Message>"
        }
      ],
      "onFinalize": {
        "to": "inputs.<Recipient Address>",
        "value": "context.<Value Variable>",
        "calldataArgs": [
          "inputs.<Arg1>",
          "inputs.<Arg2>",
          "inputs.<Arg3>"
        ]
      }
    }
  ]
}
```

## Fields Explanation

### Group Level Fields
- `groupName`: Name of the action group (e.g., "ERC20", "Native Transfer").
- `tags`: Array of tags for categorization. Available tags: "DeFi", "Token", "Other", "Safe".
- `logo`: Logo configuration for the group.
  - `type`: Either "character" for single character or "url" for image URL.
  - `value`: The character or URL value.
- `chainIds`: List of supported chain IDs. Use `[0]` to support all chains.

### Action Level Fields
- `name`: Name of the action (e.g., "Transfer", "Approve").
- `display.description`: User-friendly description of the action.
- `functionSignature`: Smart contract function signature (optional for custom data transactions).
- `summaryView`: Transaction type for UI display. Must match `TransactionType` enum values:
  - `"ethTransfer"`: For native ETH transfers
  - `"erc20Transfer"`: For ERC20 token transfers  
  - `"contractCall"`: For generic contract interactions

### Input Types
The `type` field in inputs supports the following `InputTypeType` values:
- `"text"`: Basic text input field
- `"address"`: Address input with validation
- `"selectOne"`: Dropdown selection (single choice)
- `"selectOneWithFreeSolo"`: Dropdown with custom input option
- `"selectOneWithFreeSoloAddress"`: Address dropdown with custom input
- `"selectOneRadio"`: Radio button selection

### Input Configuration
- `name`: Unique variable name for the input.
- `label`: Display label shown in the UI.
- `type`: Input type from `InputTypeType` enum.
- `options`: Array of selectable options (for select input types).
  - `chainId`: Chain ID for chain-specific options.
  - `options`: Array of `{name, value}` pairs.

### Context Variables
- Holds dynamically updated values not directly shown to users.
- Automatically includes `safeAddress` from the application.
- Updated via `onInputUpdate` RPC calls.
- Used in expressions for validation and finalization.

### Input Updates
- `variable`: Context variable to update (e.g., "context.tokenDecimals").
- `value.type`: Type of value fetch operation:
  - `"eth_call"`: Smart contract read call
  - `"eth_getBalance"`: Get account balance
- `value.id`: Unique identifier for the operation.
- `value.data`: Configuration for the fetch operation.

### Details View
- `label`: Label displayed to the user.
- `value`: Expression to evaluate using context and inputs.
- `type`: Display type (typically "Text").

### Validations
- `variable`: Input variable to validate (e.g., "inputs.recipient").
- `type`: Validation type:
  - `"expression"`: JavaScript expression evaluation
  - `"regex"`: Regular expression matching
- `id`: Unique validation identifier.
- `value`: Validation expression or regex pattern.
- `errorMessage`: Error message shown when validation fails.

### Finalization
Defines how to construct the final transaction:

#### Using Function Signature + Args
```json
"onFinalize": {
  "to": "inputs.contractAddress",
  "value": "0",
  "calldataArgs": [
    "inputs.recipient",
    "inputs.amount"
  ]
}
```

#### Using Raw Data
```json
"onFinalize": {
  "to": "inputs.contractAddress", 
  "value": "inputs.ethAmount",
  "data": "inputs.calldata"
}
```

## Expression Evaluation
Templates support JavaScript-like expressions in:
- `detailsView.value`: For displaying computed values
- `onFinalize` fields: For transaction parameters
- `onUpdateValidations.value`: For validation logic
- `onInputUpdate.data` fields: For RPC call parameters

Available variables:
- `inputs.<inputName>`: User input values
- `context.<contextVar>`: Context variables
- Standard math functions: `pow()`, etc.

## Tag Categories
Groups can be tagged with the following categories:
- `"DeFi"`: DeFi protocol interactions
- `"Token"`: Token-related operations  
- `"Other"`: Miscellaneous operations
- `"Safe"`: Safe-specific operations

## Example Template Structure

```json
{
  "groupName": "ERC20",
  "tags": ["Token"],
  "logo": {
    "type": "character",
    "value": "T"
  },
  "chainIds": [0],
  "actions": [
    {
      "name": "Transfer",
      "display": {
        "description": "Transfer ERC20 tokens to another address"
      },
      "functionSignature": "function transfer(address to, uint256 amount) public returns (bool)",
      "summaryView": "contractCall",
      "context": {
        "decimals": {
          "type": "uint8",
          "defaultValue": "18"
        }
      },
      "inputs": [
        {
          "name": "tokenAddress",
          "label": "Token Contract Address",
          "type": "selectOneWithFreeSoloAddress",
          "options": [
            {
              "chainId": 1,
              "options": [
                { "name": "USDT", "value": "0xdAC17F958D2ee523a2206206994597C13D831ec7" }
              ]
            }
          ]
        },
        {
          "name": "recipient",
          "label": "Recipient Address", 
          "type": "address"
        },
        {
          "name": "amount",
          "label": "Amount",
          "type": "text"
        }
      ],
      "onInputUpdate": [
        {
          "variable": "context.decimals",
          "value": {
            "type": "eth_call",
            "id": "getDecimals",
            "data": {
              "method": "function decimals() view returns (uint8)",
              "to": "inputs.tokenAddress", 
              "args": []
            }
          }
        }
      ],
      "detailsView": [
        {
          "label": "Token Decimals",
          "value": "context.decimals",
          "type": "Text"
        }
      ],
      "onUpdateValidations": [
        {
          "variable": "inputs.amount",
          "type": "expression", 
          "id": "positiveAmount",
          "value": "inputs.amount > 0",
          "errorMessage": "Amount must be greater than 0"
        }
      ],
      "onFinalize": {
        "to": "inputs.tokenAddress",
        "value": "0",
        "calldataArgs": [
          "inputs.recipient",
          "inputs.amount"
        ]
      }
    }
  ]
}
```

## Common Template Patterns

### Native Token Transfer
- Uses `summaryView: "ethTransfer"`
- Uses `eth_getBalance` for balance checks
- Value is specified in wei units
- No `functionSignature` required since it's a direct ETH transfer

### ERC20 Token Operations
- Uses `summaryView: "contractCall"` 
- Requires token contract address input
- Uses `eth_call` to fetch decimals and balances
- Amount: `amount`
- Requires `functionSignature` for the ERC20 method

### Smart Contract Interactions
- Uses `summaryView: "contractCall"`
- Can use either `calldataArgs` with `functionSignature` or raw `data`
- Supports complex validation expressions
- Can include ETH value in `value` field

## Template Validation and Best Practices

### Required Fields
- `groupName`: Must be unique across templates
- `chainIds`: Must include at least one chain ID or `[0]` for all chains
- `actions`: Must contain at least one action
- Each action must have: `name`, `display.description`, `summaryView`, `inputs`, `onFinalize`

### Logo Configuration
**Important**: Use the `logo` object format, not `logoUrl`. The correct format is:
```json
"logo": {
  "type": "character",  // or "url"
  "value": "T"         // character or URL string
}
```

### Value Fetch Types
- `"eth_call"`: For smart contract read calls, uses `data.method`, `data.to`, `data.args`
- `"eth_getBalance"`: For account balance queries, uses `data.params`

### Validation Best Practices
- Always validate addresses with regex: `^0x[a-fA-F0-9]{40}$`
- Use expression validation for balance checks
- Provide meaningful error messages
- Validate numeric inputs with appropriate regex patterns

### Expression Context
All expressions have access to:
- `inputs.*`: All input field values
- `context.*`: All context variables including `safeAddress`
- Math functions: `pow()`, `abs()`, `floor()`, `ceil()`, etc.

---

This specification ensures structured, reliable, and validated interactions with smart contracts, enabling developers to create customizable and templates that integrate seamlessly with the Safe transaction builder.

