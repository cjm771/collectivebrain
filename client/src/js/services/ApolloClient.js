import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: `${ process.env.DOMAIN }/graphql`
});

export default client;