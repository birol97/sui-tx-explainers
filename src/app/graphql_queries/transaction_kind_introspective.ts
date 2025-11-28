import { gql } from '@apollo/client';

// Export the query as a constant
export const GET_TRANSACTION_KIND = gql`
  query TransactionKind($digest: String!) {
    transaction(digest: $digest) {
        # Transaction kind details
    kind {
      __typename
      ... on ProgrammableTransaction {
        # Inputs
        inputs {
          nodes {
            ... on OwnedOrImmutable {
              object {
                address
                asMoveObject {
                  contents { json ,type{
                    repr
                  }}
                }
              }
            }
            ... on Receiving {
              object { address }
            }
            ... on Pure { bytes }
            ... on SharedInput { address }
          }
        }

        # Commands
        commands(first: 40) {
          nodes {
            ... on TransferObjectsCommand {
              inputs{
                ... on TxResult{
                  cmd,
                  ix
                  
                }
                
             ... on Input{
              ix
            }  
                ... on GasCoin {
                  
                  _
                }
              }
            address{
                   ... on TxResult{
                  cmd,
                  ix
                  
                }
                
             ... on Input{
              ix
            }  
                ... on GasCoin {
                  
                  _
                }
              
            }  
            }
            ... on MakeMoveVecCommand {
              type { repr }
            }
            ... on MergeCoinsCommand {
              coin {
                # Only safe fields to query
                __typename
                ... on Input { ix }
              }
            }
            ... on MoveCallCommand {
              function {
                name
                module {
                  name
                  package { address }
                }
                parameters { repr }
                return { repr }
              }
            }
                      ... on SplitCoinsCommand{
                         coin {
                   ... on GasCoin {
                _
              }
                ... on Input {
                  
                  ix
                }
               ... on TxResult{
                cmd,
                ix
                
              }
              }  
              amounts {
               ... on GasCoin {
                _
              }
                ... on Input {
                  
                  ix
                }
               ... on TxResult{
                cmd,
                ix
                
              }
              }
            }
          }
        }
      }
    }
    }
  }
`;



export const GET_TRANSACTION_KIND_DETAILS = gql`
  query TransactionKind($digest: String!) {
    transaction(digest: $digest) {
      digest
      kind {
        __typename
      }
    }
  }
`;