export default {
    developement: {
        type: 'developement',
        port: 3000,
        mongodb: 'mongodb+srv://m1api:julien@cluster0.rldabee.mongodb.net/m1-api-dev?retryWrites=true&w=majority&appName=Cluster0'
    },
    production: {
        type: 'production',
        port: 3000,
        mongodb: 'mongodb+srv://m1api:julien@cluster0.rldabee.mongodb.net/m1-api?retryWrites=true&w=majority&appName=Cluster0'
    }
};
