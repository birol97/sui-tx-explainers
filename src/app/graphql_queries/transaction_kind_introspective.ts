import { gql } from '@apollo/client';

// Export the query as a constant
export const GET_TRANSACTION_KIND = gql`
  query TransactionKind($digest: String!) {
    transaction(digest: $digest) {

    expiration {
    startTimestamp,
    endTimestamp
    }
        # Transaction kind details
    kind {
      __typename

      ... on ConsensusCommitPrologueTransaction {
      epoch{
      startTimestamp,
      endTimestamp
      
      }

      
      }
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

export const GET_OTHER_INFOS = gql `query GetTransactionEffects($digest: String!) {
  transaction(digest: $digest) {
    digest
    transactionBcs

    # Gas info
    gasInput {
      gasSponsor { address }
      gasPrice
    }

    # Sender
    sender { address }

    

    # Effects
    effects {
      digest
      status
      timestamp

      # Object changes
      objectChanges(first: 10) {
        nodes {
          idCreated
          idDeleted
          address

          inputState {
            address
            asMoveObject {
              address
              contents { json }
              owner {
                ... on AddressOwner { address { address } }
                ... on ObjectOwner {address { address } }
             
              }
            }
          }

          outputState {
            address
            defaultSuinsName
            asMoveObject {
              address
              contents { json }
              owner {
                ... on AddressOwner { address { address } }
                ... on ObjectOwner {address { address } }
              }
            }
          }
        }
      }

      # Events
      events(first: 5) {
        pageInfo { hasNextPage }
        nodes {
          sequenceNumber
          timestamp
          sender { address }
          contents { type { repr } }
          transaction { digest }
          transactionModule {
            package { address }
            name
          }
        }
      }

      # Balance changes
      balanceChanges(first: 5) {
        nodes {
          owner { address }
          coinType { repr signature }
          amount
        }
      }
    }
  }
}

`;