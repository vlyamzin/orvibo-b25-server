const crc32 = require('buffer-crc32');
const crypto = require('crypto');
const RfTimeArray = require('./OrviboRfTimeArray');

let Packet = {
    encryptionKey: '',
    magic: new Buffer.from("6864", 'hex'),
    build: function () {
        let packetId = new Buffer.from(this.id, 'ascii');
        let payload = encodePayload(JSON.stringify(this.json), this.encryptionKey);
        let crc = crc32(payload);
        let length = getLength([this.magic, this.packetType, packetId, crc, payload], 2); // Extra 2 for the length field itself
        return Buffer.concat([this.magic, length, this.packetType, crc, packetId, payload]);
    }
};

let PKPacket = Object.assign({}, Packet, {
    packetType: new Buffer.from('pk', 'ascii'),
});

let DKPacket = Object.assign({}, Packet, {
    packetType: new Buffer.from('dk', 'ascii'),
});

let rfPacket = function ({ encryptionKey, id, state, uid, serial, clientSessionId, deviceId }) {
    let json = {
        ver: "5.0.25.302",
        value2: 0,
        modulation: "OOK",
        value1: +state,
        value4: state === '30002' ? -1 : 0,
        fromMq: true,
        value3: 0,
        timeArray: [
            { "array": [280, -600, 280, -600, 280, -600, 280, -600, 280, -600, 280, -600, 280, -600, 280, -600], "count": 1 },
            RfTimeArray.get(state),
            { "array": [600, -5000], "count": 1 }
        ],
        deviceId,
        respByAcc: false,
        uid,
        clientSessionId,
        clientType: 2,
        propertyResponse: 0,
        serial,
        delayTime: 0,
        cmd: 15,
        // MAYBE random
        // id: '0xce6907',
        order: 'rf control'
    }

    let pkt = Object.assign(Object.create(DKPacket), {
        json,
        id,
        encryptionKey
    });

    return pkt.build();
}

let helloPacket = function ({ serial, encryptionKey, id, orviboKey }) {
    let json = {
        cmd: 0,
        status: 0,
        serial: serial,
        key: encryptionKey
    };

    let pkt = Object.assign(Object.create(PKPacket), {
        json: json,
        id: id,
        encryptionKey: orviboKey,
    });

    return pkt.build();
};

let handshakePacket = function ({ serial, encryptionKey, id }) {

    let json = {
        cmd: 6,
        status: 0,
        serial: serial
    };

    let pkt = Object.assign(Object.create(DKPacket), {
        json: json,
        id: id,
        encryptionKey: encryptionKey
    });

    return pkt.build();
};

let heartbeatPacket = function ({ serial, uid, encryptionKey, id }) {
    let json = {
        cmd: 32,
        status: 0,
        serial: 4,
        uid: uid,
        utc: new Date().getTime()
    };

    let pkt = Object.assign(Object.create(DKPacket), {
        json: json,
        id: id,
        encryptionKey,
    });

    return pkt.build();
};

let comfirmStatePacket = function ({ serial, uid, state, encryptionKey, id }) {

    let json = {
        uid: uid,
        cmd: 42,
        statusType: 0,
        value3: 0,
        alarmType: 1,
        serial: serial,
        value4: 0,
        deviceId: 0,
        value1: state,
        value2: 0,
        updateTimeSec: new Date().getTime(),
        status: 0
    };

    let pkt = Object.assign(Object.create(DKPacket), {
        json: json,
        id: id,
        encryptionKey,
    });

    return pkt.build();
};

let defaultPacket = function ({ serial, uid, cmd, id, encryptionKey }) {

    let json = {
        uid: uid,
        cmd: cmd,
        serial: serial,
        status: 0
    };

    let pkt = Object.assign(Object.create(DKPacket), {
        json: json,
        id: id,
        encryptionKey,
    });

    return pkt.build();
};


let updatePacket = function ({ uid, state, serial, id, clientSessionId, deviceId, encryptionKey }) {
    let json = {
        uid: uid,
        delayTime: 0,
        cmd: 15,
        order: state === 0 ? "on" : "off",
        userName: "iloveorvibo@orvibo.com",
        ver: "3.0.0",
        value3: 0,
        serial: serial,
        value4: 0,
        deviceId: deviceId,
        value1: state,
        value2: 0,
        clientSessionId: clientSessionId
    };

    let pkt = Object.assign(Object.create(DKPacket), {
        json: json,
        id: id,
        encryptionKey,
    });

    return pkt.build();
};


let encodePayload = function (json, key) {
    let cipher = crypto.createCipheriv('aes-128-ecb', key, '');
    cipher.setAutoPadding(true);
    let crypted = cipher.update(json, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return new Buffer.from(crypted, 'hex');
};

let getLength = function (items, extra) {
    let length = extra || 0;
    for (let i = 0; i < items.length; i++) {
        length += items[i].length;
    }
    return getHexLengthPadded(length);
};

let getHexLengthPadded = function (lengthDecimal) {
    let lengthHex = lengthDecimal.toString(16);
    let paddingLength = 4 - lengthHex.length;
    let padding = '';
    for (let i = 0; i < paddingLength; i++) {
        padding += 0;
    }
    return new Buffer.from(padding + lengthHex, 'hex');
};


module.exports.helloPacket = helloPacket;
module.exports.handshakePacket = handshakePacket;
module.exports.heartbeatPacket = heartbeatPacket;
module.exports.comfirmStatePacket = comfirmStatePacket;
module.exports.defaultPacket = defaultPacket;
module.exports.updatePacket = updatePacket;
module.exports.rfPacket = rfPacket;