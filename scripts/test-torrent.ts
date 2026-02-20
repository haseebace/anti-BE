import WebTorrent from 'webtorrent';

console.log('Successfully imported WebTorrent');
const client = new WebTorrent();
console.log('Successfully created client');
client.destroy();
console.log('Successfully destroyed client');
