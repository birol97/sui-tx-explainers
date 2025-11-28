
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';


const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://graphql.testnet.sui.io/graphql' }),
  cache: new InMemoryCache()
});

export default client;