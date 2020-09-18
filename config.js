const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;


console.log('DB_HOST', DB_HOST)
console.log('DB_PORT', DB_PORT)
console.log('DB_DATABASE', DB_DATABASE)
console.log('DB_USERNAME', DB_USERNAME)
console.log('DB_PASSWORD', DB_PASSWORD)
console.log('Database Config ready...')

module.exports = {
    HOST: DB_HOST,
    PORT: DB_PORT,
    DATABASE: DB_DATABASE,
    USERNAME: DB_USERNAME,
    PASSWORD: DB_PASSWORD,
}