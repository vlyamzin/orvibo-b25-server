const Orvibo = require('./Orvibo/Orvibo');
const express = require('express')
const bodyParser = require('body-parser');
const { PORT, ORVIBO_KEY, ORVIBO_DEVICE_UID, ORVIBO_DEVICE_NAME } = process.env;

const orviboSettings = {
  LOG_PACKET: false,
  ORVIBO_KEY,
  plugInfo: [
    {
      uid: ORVIBO_DEVICE_UID,
      name: ORVIBO_DEVICE_NAME
    },
  ],
}


const server = express();
const orvibo = new Orvibo(orviboSettings);

server.use(bodyParser.json());

server.get('/', (req, res) => {
  res.send('Hello World!');
});

server.get('/devices', (req, res) => {
  try {
    let devices = orvibo.getConnectedDevices();

    res.status(200).json(devices);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to fetch connected devices' })
  }
});

server.get('/device/:uid', (req, res) => {
  try {
    const devices = orvibo.getConnectedDevices();
    const device = (devices || []).find(d => d.uid === req.params.uid);

    device ? res.status(200).json({ device }) : res.status(404).json({ error: `Device with uid ${req.params.uid} not found` })
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to fetch connected devices' })
  }
});

server.post('/socket/toggle', (req, res) => {
  try {
    let uid = req.body?.uid;

    if (!uid) {
      res.status(404).json({ error: "UID is not provided" });
      return;
    }

    orvibo.toggleSocket(uid);
    const socket = orvibo.getConnectedDevices().find(d => d.uid === uid);
    res.status(200).json({ socket });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to toggle socket state' })
  }
});

server.post('/blinds/open', (req, res) => {
  try {
    let uid = req.body?.uid;

    if (!uid) {
      res.status(404).json({ error: "UID is not provided" });
      return;
    }

    orvibo.rfEmit(uid, 'open');
    const socket = orvibo.getConnectedDevices().find(d => d.uid === uid);
    res.status(200).json({ socket });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to open blinds' })
  }
})

server.post('/blinds/close', (req, res) => {
  try {
    let uid = req.body?.uid;

    if (!uid) {
      res.status(404).json({ error: "UID is not provided" });
      return;
    }

    orvibo.rfEmit(uid, 'close');
    const socket = orvibo.getConnectedDevices().find(d => d.uid === uid);
    res.status(200).json({ socket });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to open blinds' })
  }
})

server.post('/blinds/stop', (req, res) => {
  try {
    let uid = req.body?.uid;

    if (!uid) {
      res.status(404).json({ error: "UID is not provided" });
      return;
    }

    orvibo.rfEmit(uid, 'stop');
    const socket = orvibo.getConnectedDevices().find(d => d.uid === uid);
    res.status(200).json({ socket });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to open blinds' })
  }
})

orvibo.startServer();

server.listen(PORT, () => {
  console.log(`Orvibo API service is running on port ${PORT}`)
})

