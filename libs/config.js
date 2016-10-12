/**
 * Created by lukaijie on 16/5/30.
 */
module.exports = {
    api_provider: {
        port: 8081,
        oauth_login:'http://192.168.94.104:8081/oauth&view=pengshuai',
        logout_url: 'http://192.168.94.104:8081/apis'
    },
    oauth: {
        client_id: 'osx3aamp',
        client_secret: 'f5mfepfbmti7fkqlkidm'
    },
    oauth_register: {
        app_key: 'ppdkmypd',
        app_secret: 'vsr77fqsgaygkovic6ay'
    },
    app_gateway_online_http: 'http://192.168.0.1',
    app_gateway_online_https: 'http://192.168.0.2',
    app_gateway_sndbox_http: 'http://192.168.0.3',
    app_gateway_sndbox_https: 'http://192.168.0.4',
    redis: {
        port: 6379,          // Redis port
        host: '127.0.0.1',   // Redis host
        family: 4,           // 4 (IPv4) or 6 (IPv6)
        db: 0
    }
}
