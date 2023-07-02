// Import required packages and models
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/users';

// Define the User type
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    token: { type: GraphQLString },
  }),
});

// Define the RootQuery type
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }) => {
        return UserModel.findById(id);
      },
    },
  },
});

// Define the mutations
const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    register: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { email, password }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({
          email,
          password: hashedPassword,
        });
        await user.save();
        return user;
      },
    },
login: {
  type: UserType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, { email, password }) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('Password not set');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET! , {
      expiresIn: '1s',
    });

    return {
      id: user.id,
      email: user.email,
      token: token,
    };
  },
},

  },
});

// Create the GraphQL schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

export default schema;
