import redis from 'redis';

const client = redis.createClient({
    port: 6379,
    host: '127.0.0.1',
});

client.on('connect', () => {
    console.log('Client connected to Redis.'.red.bold);
});

client.on('ready', () => {
    console.log('Client Ready to use.'.red.italic.bold);
});

client.on('error', (err: any) => {
    console.log(err.message);
});

client.on('end', () => {
    console.log('Client disconnected from redis'.red.italic.bold);
});

process.on('SIGINT', () => {
    client.quit();
});

export default client;
