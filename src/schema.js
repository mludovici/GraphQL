const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID
} = graphql;

const users = [
    { id: '23', firstName: 'Bill', age: 20},
    { id: '47', firstName: 'Marc', age: 33}
]

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                console.log("ParentValue:", parentValue);
                return axios.get(`http://localhost:8888/companies/${parentValue.id}/users`)
                .then(res=>res.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: "user",
    fields: () => ({
        id: {type: GraphQLString} ,
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(parentValue,args) {
                return axios.get(`http://127.0.0.1:8888/companies/${parentValue.companyId}`)
                .then(res => res.data);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString }},
            resolve(parentValue, args) {
                return axios.get(`http://127.0.0.1:8888/users/${args.id}`)
                .then(response => response.data)
                .catch(err => console.log(err));
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString }},
            resolve(parentValue, args) {
                return axios.get(`http://127.0.0.1:8888/companies/${args.id}`)
                .then(response => response.data)
                .catch(err => console.log(err));
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                id: { type: GraphQLString  },
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, {firstName, age}) {
                return axios.post(`http://localhost:8888/users`, {
                    firstName, age
                }).then(res => res.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, {id}) {
                return axios.delete(`http://localhost:8888/users/${id}`)
                .then(res => res.data)
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:8888/users/${args.id}`, args)
                .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});

// let query = '{ user(id: "47")  { id, age }}';

// graphql(schema, query).then(result => {
//     console.log("Result:", result);
// })