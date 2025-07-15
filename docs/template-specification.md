# Smart Contract Interaction Template Specification

## Overview
This document specifies the structure for creating templates that facilitate interactions with different smart contracts and a safe smart account. The templates define groups of actions, which are rendered in the UI panel. Each action corresponds to a function call on a smart contract and includes input fields, validation rules, and context updates.

## Context Injection
- The application injects `context.safeAddress` automatically.
- `detailView` is provided to users to visualize the action details.
- `inputs` support text fields and text fields with predefined options.
- `context` is not shown to users but updates dynamically when inputs change.
- `validations` are triggered upon changes in `inputs` and `context`.
- `functionSignature` defines the function call on the smart contract, using values from `onFinalize`.

## Specification

### Transaction Types Specification
Each transaction type group consists of multiple actions, categorized by their functionality.

```json
{
  "transactionTypesSpec": [
    {
      "groupName": "<Group Name>",
      "chainIds": [<List of Supported Chain IDs>],
      "actions": [
        {
          "name": "<Action Name>",
          "display": {
            "description": "<Description of Action>"
          },
          "functionSignature": "function transfer(address _to, uint256 _value) public returns (bool success)",
          "summaryView": "contractCall",
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
              "type": "<Input Type>",
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
                "type": "rpcCall",
                "id": "<RPC Call ID>",
                "data": {
                  "method": "<Smart Contract Read Method>",
                  "to": "inputs.<Input Variable>",
                  "args": ["context.safeAddress"]
                }
              }
            }
          ],
          "detailsView": [
            {
              "label": "<Detail Label>",
              "value": "<Context Variable or Computed Expression>",
              "type": "Text"
            }
          ],
          "onUpdateValidations": [
            {
              "variable": "inputs.<Input Variable>",
              "type": "<Validation Type>",
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
              "inputs.<Arg3> * pow(10, context.<Decimals Variable>)"
            ]
          }
        }
      ]
    }
  ]
}
```

## Fields Explanation

### Groups
- `groupName`: Name of the action group (e.g., "ERC20").
- `chainIds`: List of supported chain IDs.

### Actions
- `name`: Name of the action (e.g., "Transfer").
- `display.description`: User-friendly description of the action.
- `functionSignature`: Smart contract function that is executed (e.g., `function transfer(address _to, uint256 _value) public returns (bool success)`).
- `summaryView`: Type of summary displayed in the UI (e.g., "contractCall").

### Inputs
- `name`: Unique variable name.
- `label`: Display label for UI.
- `type`: Input field type (e.g., `TextField`, `SelectOne`).
- `options`: List of predefined selectable options for `SelectOne` fields.

### Context
- Holds dynamically updated values that are not shown directly to users.
- Example values include token balances and decimals.

### Input Updates
- `onInputUpdate`: Defines RPC calls that update `context` variables dynamically.

### Details View
- `detailsView`: Provides users with a summary of relevant details.
- Example: Displaying token decimals and current balance.

### Validations
- `onUpdateValidations`: Runs input validation rules dynamically.
- Supports regex and logical expressions to enforce correct inputs.

### Finalization
- `onFinalize`: Defines the smart contract call structure and parameters.
- Uses values from `inputs` and `context` to execute the transaction.

## Example Groups

### ERC20 Group
- **Actions:**
  - **Transfer**: Sends tokens to another address.
  - **Approve**: Grants approval for a spender to use tokens.
  - **TransferFrom**: Transfers tokens from an approved address.

Each action follows the structure outlined in the specification.

---

This specification ensures structured, reliable, and validated interactions with smart contracts, enabling developers to create customizable and secure templates.

